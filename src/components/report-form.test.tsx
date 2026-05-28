import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportForm } from "@/components/report-form";
import { I18nProvider } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { ApiError, type AuthResponse } from "@/types/api";

const mocks = vi.hoisted(() => ({
  addOwnedReport: vi.fn(),
  createReport: vi.fn(),
  getStoredAuth: vi.fn(),
  listCategories: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  requestReportImageUpload: vi.fn(),
  reverseGeocodeLocation: vi.fn(),
  uploadReportImage: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

vi.mock("@/services/api", () => ({
  publicPulseApi: {
    createReport: mocks.createReport,
    listCategories: mocks.listCategories,
    requestReportImageUpload: mocks.requestReportImageUpload,
    reverseGeocodeLocation: mocks.reverseGeocodeLocation,
    uploadReportImage: mocks.uploadReportImage,
  },
}));

vi.mock("@/services/auth-storage", () => ({
  addOwnedReport: mocks.addOwnedReport,
  getStoredAuth: mocks.getStoredAuth,
}));

const auth: AuthResponse = {
  userId: "user-1",
  email: "citizen@example.com",
  token: "token-1",
  expiresAtUtc: "2026-05-13T10:00:00Z",
};

const category = {
  id: "category-1",
  name: "Road damage",
  description: null,
};

const upload = {
  cloudName: "publicpulse",
  apiKey: "api-key",
  timestamp: 1780000000,
  folder: "reports",
  uploadPreset: "publicpulse-reports",
  signature: "upload-signature",
};

const cloudinaryImage = {
  secure_url: "https://res.cloudinary.com/publicpulse/image/upload/v1/reports/road.jpg",
  public_id: "reports/road",
  version: 1,
  signature: "cloudinary-response-signature",
};

describe("ReportForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStoredAuth.mockReturnValue(auth);
    mocks.listCategories.mockResolvedValue([category]);
    mocks.requestReportImageUpload.mockResolvedValue(upload);
    mocks.reverseGeocodeLocation.mockResolvedValue({
      county: "Nairobi",
      roadName: "Kenyatta Avenue",
      locationLabel: "Kenyatta Avenue, Nairobi",
      latitude: -1.2864,
      longitude: 36.8172,
      source: "mapbox",
      confidence: "high",
    });
    mocks.uploadReportImage.mockResolvedValue(cloudinaryImage);
    mocks.createReport.mockResolvedValue({
      id: "report-1",
      description: "Large pothole.",
      categoryId: category.id,
      categoryName: category.name,
      images: [
        {
          id: "image-1",
          imageUrl: cloudinaryImage.secure_url,
          publicId: cloudinaryImage.public_id,
        },
      ],
      county: "Nairobi",
      roadName: "Main Road",
      status: 0,
      confirmationCount: 0,
      created: "2026-05-12T10:00:00Z",
      lastModified: null,
    });
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn((file: File) => `blob:${file.name}`),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires an image before submitting", async () => {
    const user = userEvent.setup();

    renderReportForm();
    await fillReportFields();

    await user.click(screen.getByRole("button", { name: "Submit report" }));

    expect(
      screen.getByText("Add at least one report image before submitting."),
    ).toBeInTheDocument();
    expect(mocks.requestReportImageUpload).not.toHaveBeenCalled();
    expect(mocks.createReport).not.toHaveBeenCalled();
  });

  it("rejects unsupported image types", async () => {
    const user = userEvent.setup({ applyAccept: false });

    renderReportForm();
    await screen.findByRole("option", { name: category.name });

    await user.upload(
      screen.getByLabelText("Images"),
      new File(["text"], "notes.txt", { type: "text/plain" }),
    );

    expect(screen.getByText("Upload a JPG, PNG, WebP, or GIF image.")).toBeInTheDocument();
    expect(screen.getByLabelText("Images")).toHaveValue("");
  });

  it("rejects oversized images", async () => {
    const user = userEvent.setup();

    renderReportForm();
    await screen.findByRole("option", { name: category.name });

    await user.upload(
      screen.getByLabelText("Images"),
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", {
        type: "image/jpeg",
      }),
    );

    expect(screen.getByText("Upload an image smaller than 5 MB.")).toBeInTheDocument();
    expect(screen.getByLabelText("Images")).toHaveValue("");
  });

  it("rejects too many images", async () => {
    const user = userEvent.setup();

    renderReportForm();
    await screen.findByRole("option", { name: category.name });

    await user.upload(
      screen.getByLabelText("Images"),
      Array.from({ length: 6 }, (_, index) =>
        new File(["image"], `road-${index}.jpg`, { type: "image/jpeg" }),
      ),
    );

    expect(screen.getByText("Upload no more than 5 report images.")).toBeInTheDocument();
    expect(screen.getByLabelText("Images")).toHaveValue("");
  });

  it("uploads images before creating the report", async () => {
    const user = userEvent.setup();
    const file = new File(["image"], "road.jpg", { type: "image/jpeg" });

    renderReportForm();
    await fillReportFields();
    await user.upload(screen.getByLabelText("Images"), file);
    await user.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() => {
      expect(mocks.requestReportImageUpload).toHaveBeenCalledWith(auth.token);
    });
    expect(mocks.uploadReportImage).toHaveBeenCalledWith(upload, file);
    expect(mocks.createReport).toHaveBeenCalledWith(
      {
        description: "Large pothole near the junction.",
        categoryId: category.id,
        county: "Nairobi",
        roadName: "Main Road",
        images: [
          {
            publicId: cloudinaryImage.public_id,
            version: "1",
            signature: cloudinaryImage.signature,
          },
        ],
      },
      auth.token,
    );
    expect(mocks.addOwnedReport).toHaveBeenCalledWith(auth.userId, "report-1");
    expect(mocks.push).toHaveBeenCalledWith("/en/reports/report-1");
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("prefills location from browser coordinates before creating the report", async () => {
    const user = userEvent.setup();
    const file = new File(["image"], "road.jpg", { type: "image/jpeg" });
    const getCurrentPosition = mockGeolocationSuccess({
      latitude: -1.2864,
      longitude: 36.8172,
    });

    renderReportForm();
    await screen.findByRole("option", { name: category.name });
    await user.click(screen.getByRole("button", { name: "Use my location" }));

    await waitFor(() => {
      expect(mocks.reverseGeocodeLocation).toHaveBeenCalledWith(-1.2864, 36.8172);
    });
    expect(getCurrentPosition).toHaveBeenCalled();
    expect(screen.getByLabelText("County")).toHaveValue("Nairobi");
    expect(screen.getByLabelText("Road name")).toHaveValue("Kenyatta Avenue");
    expect(
      screen.getByText("Location suggestion added. Review the fields before submitting."),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("Description"),
      " Large pothole near the junction. ",
    );
    await user.upload(screen.getByLabelText("Images"), file);
    await user.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() => {
      expect(mocks.createReport).toHaveBeenCalledWith(
        {
          description: "Large pothole near the junction.",
          categoryId: category.id,
          county: "Nairobi",
          roadName: "Kenyatta Avenue",
          latitude: -1.2864,
          longitude: 36.8172,
          locationLabel: "Kenyatta Avenue, Nairobi",
          locationSource: "mapbox",
          images: [
            {
              publicId: cloudinaryImage.public_id,
              version: "1",
              signature: cloudinaryImage.signature,
            },
          ],
        },
        auth.token,
      );
    });
  });

  it("keeps manual location entry usable when browser permission is denied", async () => {
    const user = userEvent.setup();

    mockGeolocationError({ code: 1 });

    renderReportForm();
    await screen.findByRole("option", { name: category.name });
    await user.click(screen.getByRole("button", { name: "Use my location" }));

    expect(
      await screen.findByText(
        "Location permission was denied. Enter the county and road name manually.",
      ),
    ).toBeInTheDocument();
    expect(mocks.reverseGeocodeLocation).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("County"), "Nairobi");
    await user.type(screen.getByLabelText("Road name"), "Main Road");

    expect(screen.getByLabelText("County")).toHaveValue("Nairobi");
    expect(screen.getByLabelText("Road name")).toHaveValue("Main Road");
  });

  it("does not overwrite user-entered location fields with partial lookup results", async () => {
    const user = userEvent.setup();

    mockGeolocationSuccess({ latitude: -1.3, longitude: 36.8 });
    mocks.reverseGeocodeLocation.mockResolvedValue({
      county: "Nairobi",
      roadName: null,
      locationLabel: "Nairobi, Kenya",
      latitude: -1.3,
      longitude: 36.8,
      source: "mapbox",
      confidence: "medium",
    });

    renderReportForm();
    await screen.findByRole("option", { name: category.name });
    await user.type(screen.getByLabelText("County"), "Kiambu");
    await user.type(screen.getByLabelText("Road name"), "Manual Road");
    await user.click(screen.getByRole("button", { name: "Use my location" }));

    await waitFor(() => {
      expect(mocks.reverseGeocodeLocation).toHaveBeenCalledWith(-1.3, 36.8);
    });
    expect(screen.getByLabelText("County")).toHaveValue("Kiambu");
    expect(screen.getByLabelText("Road name")).toHaveValue("Manual Road");
    expect(
      screen.getByText(
        "Location found, but the road or county could not be identified. Complete the fields manually.",
      ),
    ).toBeInTheDocument();
  });

  it("adds valid images across separate selections before creating the report", async () => {
    const user = userEvent.setup();
    const firstFile = new File(["first image"], "road-before.jpg", {
      type: "image/jpeg",
    });
    const secondFile = new File(["second image"], "road-after.png", {
      type: "image/png",
    });
    const firstCloudinaryImage = {
      ...cloudinaryImage,
      public_id: "reports/road-before",
      secure_url:
        "https://res.cloudinary.com/publicpulse/image/upload/v1/reports/road-before.jpg",
    };
    const secondCloudinaryImage = {
      ...cloudinaryImage,
      public_id: "reports/road-after",
      secure_url:
        "https://res.cloudinary.com/publicpulse/image/upload/v1/reports/road-after.png",
      version: 2,
    };
    mocks.uploadReportImage
      .mockResolvedValueOnce(firstCloudinaryImage)
      .mockResolvedValueOnce(secondCloudinaryImage);

    renderReportForm();
    await fillReportFields();
    await user.upload(screen.getByLabelText("Images"), firstFile);
    await user.upload(screen.getByLabelText("Images"), secondFile);

    expect(screen.getByText("road-before.jpg")).toBeInTheDocument();
    expect(screen.getByText("road-after.png")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() => {
      expect(mocks.requestReportImageUpload).toHaveBeenCalledWith(auth.token);
    });
    expect(mocks.uploadReportImage).toHaveBeenCalledTimes(2);
    expect(mocks.uploadReportImage).toHaveBeenNthCalledWith(1, upload, firstFile);
    expect(mocks.uploadReportImage).toHaveBeenNthCalledWith(2, upload, secondFile);
    expect(mocks.createReport).toHaveBeenCalledWith(
      {
        description: "Large pothole near the junction.",
        categoryId: category.id,
        county: "Nairobi",
        roadName: "Main Road",
        images: [
          {
            publicId: firstCloudinaryImage.public_id,
            version: "1",
            signature: firstCloudinaryImage.signature,
          },
          {
            publicId: secondCloudinaryImage.public_id,
            version: "2",
            signature: secondCloudinaryImage.signature,
          },
        ],
      },
      auth.token,
    );
  });

  it("does not create a report when image upload fails", async () => {
    const user = userEvent.setup();

    mocks.uploadReportImage.mockRejectedValue(new ApiError("Upload failed.", 0));

    renderReportForm();
    await fillReportFields();
    await user.upload(
      screen.getByLabelText("Images"),
      new File(["image"], "road.jpg", { type: "image/jpeg" }),
    );
    fireEvent.submit(screen.getByRole("button", { name: "Submit report" }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Upload failed.")).toBeInTheDocument();
    });
    expect(mocks.createReport).not.toHaveBeenCalled();
  });

  it("shows backend report creation failures after successful image uploads", async () => {
    const user = userEvent.setup();

    mocks.createReport.mockRejectedValue(new ApiError("Report validation failed.", 400));

    renderReportForm();
    await fillReportFields();
    await user.upload(
      screen.getByLabelText("Images"),
      new File(["image"], "road.jpg", { type: "image/jpeg" }),
    );
    fireEvent.submit(screen.getByRole("button", { name: "Submit report" }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Report validation failed.")).toBeInTheDocument();
    });
    expect(mocks.uploadReportImage).toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});

async function fillReportFields() {
  const user = userEvent.setup();

  await screen.findByRole("option", { name: category.name });
  await user.type(
    screen.getByLabelText("Description"),
    " Large pothole near the junction. ",
  );
  await user.type(screen.getByLabelText("County"), " Nairobi ");
  await user.type(screen.getByLabelText("Road name"), " Main Road ");
}

function renderReportForm(locale: Locale = "en") {
  return render(
    <I18nProvider locale={locale} messages={messages[locale]}>
      <ReportForm />
    </I18nProvider>,
  );
}

function mockGeolocationSuccess(coords: { latitude: number; longitude: number }) {
  const getCurrentPosition = vi.fn(
    (success: PositionCallback) => {
      success({
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    },
  );

  vi.stubGlobal("navigator", {
    ...navigator,
    geolocation: {
      getCurrentPosition,
    },
  });

  return getCurrentPosition;
}

function mockGeolocationError(error: { code: number }) {
  const getCurrentPosition = vi.fn(
    (_success: PositionCallback, failure?: PositionErrorCallback | null) => {
      failure?.({
        code: error.code,
        message: "Permission denied.",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    },
  );

  vi.stubGlobal("navigator", {
    ...navigator,
    geolocation: {
      getCurrentPosition,
    },
  });

  return getCurrentPosition;
}
