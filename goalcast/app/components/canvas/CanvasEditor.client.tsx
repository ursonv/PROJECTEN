import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useMemo,
} from "react";
import {
  Stage,
  Layer,
  FastLayer,
  Rect,
  Line,
  Image as KonvaImage,
} from "react-konva";
import { renderUitslagenTable, TableRow } from "./templates/uitslagen";
import { renderAfbeeldingTemplate } from "./templates/afbeelding";
import { renderUpcomingGameTemplate } from "./templates/upcominggame";
import { renderFotogalerijTemplate } from "./templates/fotogalerij";

export type TemplateType =
  | "none"
  | "uitslagen"
  | "afbeelding"
  | "upcoming"
  | "fotogalerij";

export type Props = {
  defaultImage?: string;
  defaultTemplateType?: TemplateType;
  defaultBackgroundColor?: string;
  defaultStripeColor1?: string;
  defaultStripeColor2?: string;
  defaultColumns?: string[];
  defaultTableRows?: TableRow[];
  defaultAfbeeldingUrl?: string;
  defaultHomeTeam?: string;
  defaultAwayTeam?: string;
  defaultMatchDate?: string;
  defaultMatchTime?: string;
  defaultAddress?: string;
  defaultGalleryUrls?: string[];
  defaultGalleryCols?: number;
  defaultGalleryGap?: number;
  defaultGalleryPadding?: number;
  defaultGalleryTitle?: string;
};

export type CanvasEditorState = {
  imageDataUrl?: string;
  type: TemplateType;
  backgroundColor: string;
  stripeColor1: string;
  stripeColor2: string;
  columns?: string[];
  tableRows?: TableRow[];
  afbeeldingUrl?: string | null;
  homeTeam?: string;
  awayTeam?: string;
  matchDate?: string;
  matchTime?: string;
  address?: string;
  logoUrl?: string | null;
  galleryUrls?: string[];
  galleryCols?: number;
  galleryGap?: number;
  galleryPadding?: number;
  galleryTitle?: string;
};

export type CanvasEditorHandle = {
  exportAsImage: () => string | undefined;
  exportState: () => CanvasEditorState;
};

const defaultColumnsDefault = ["POS", "CLUB", "GS", "DV", "DT", "PTS"];


async function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!url.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

function drawDownscaled(
  img: HTMLImageElement,
  maxW: number,
  maxH: number
): HTMLCanvasElement | HTMLImageElement {
  const scale = Math.min(1, maxW / img.width, maxH / img.height);
  if (scale >= 1) return img;
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.width * scale));
  c.height = Math.max(1, Math.round(img.height * scale));
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

async function loadAndDownscale(
  url: string,
  maxW: number,
  maxH: number
): Promise<HTMLCanvasElement | HTMLImageElement> {
  const img = await loadImageElement(url);
  return drawDownscaled(img, maxW, maxH);
}

function useRafThrottle<T extends (...args: any[]) => void>(fn: T) {
  const frame = useRef<number | null>(null);
  const lastArgs = useRef<any[] | null>(null);
  const cb = useCallback((...args: any[]) => {
    lastArgs.current = args;
    if (frame.current == null) {
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        if (lastArgs.current) fn(...lastArgs.current);
      });
    }
  }, [fn]);
  useEffect(() => () => {
    if (frame.current != null) cancelAnimationFrame(frame.current);
  }, []);
  return cb as T;
}

function useRafDebounce<T extends (...args: any[]) => void>(fn: T) {
  const ref = useRef<number | null>(null);
  const cb = useCallback((...args: any[]) => {
    if (ref.current) cancelAnimationFrame(ref.current);
    ref.current = requestAnimationFrame(() => fn(...args));
  }, [fn]);
  useEffect(() => () => {
    if (ref.current) cancelAnimationFrame(ref.current);
  }, []);
  return cb as T;
}

const CanvasEditor = forwardRef<CanvasEditorHandle, Props>(
  (
    {
      defaultImage,
      defaultTemplateType = "none",
      defaultBackgroundColor = "#ffffff",
      defaultStripeColor1 = "#002b7f",
      defaultStripeColor2 = "#ff0000",
      defaultTableRows = [],
      defaultColumns = defaultColumnsDefault,
      defaultAfbeeldingUrl,
      defaultHomeTeam = "",
      defaultAwayTeam = "",
      defaultMatchDate = "",
      defaultMatchTime = "",
      defaultAddress = "",
      defaultGalleryUrls = [],
      defaultGalleryCols = 3,
      defaultGalleryGap = 20,
      defaultGalleryPadding = 100,
      defaultGalleryTitle = "",
    },
    ref
  ) => {
    const [isMyTeam, setIsMyTeam] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState(defaultBackgroundColor);
    const [stripeColor1, setStripeColor1] = useState(defaultStripeColor1);
    const [stripeColor2, setStripeColor2] = useState(defaultStripeColor2);
    const [templateType, setTemplateType] = useState<TemplateType>(defaultTemplateType);

    const [logoUrl, setLogoUrl] = useState<string | null>(defaultImage || null);
    const [afbeeldingUrl, setAfbeeldingUrl] = useState<string | null>(defaultAfbeeldingUrl || null);

    const [homeTeam, setHomeTeam] = useState(defaultHomeTeam);
    const [awayTeam, setAwayTeam] = useState(defaultAwayTeam);
    const [matchDate, setMatchDate] = useState(defaultMatchDate);
    const [matchTime, setMatchTime] = useState(defaultMatchTime);
    const [address, setAddress] = useState(defaultAddress);

    const [columns, setColumns] = useState<string[]>(defaultColumns);
    const [tableRows, setTableRows] = useState<TableRow[]>(defaultTableRows);
    const [showInputPopup, setShowInputPopup] = useState(false);
    const [newRowValues, setNewRowValues] = useState<string[]>(columns.map(() => ""));

    const [galleryUrls, setGalleryUrls] = useState<string[]>(defaultGalleryUrls);
    const [galleryImages, setGalleryImages] = useState<(HTMLImageElement | HTMLCanvasElement | null)[]>([]);
    const [galleryCols, setGalleryCols] = useState<number>(defaultGalleryCols);
    const [galleryGap, setGalleryGap] = useState<number>(defaultGalleryGap);
    const [galleryPadding, setGalleryPadding] = useState<number>(defaultGalleryPadding);
    const [galleryTitle, setGalleryTitle] = useState<string>(defaultGalleryTitle);

    const [logoPreview, setLogoPreview] = useState<HTMLImageElement | HTMLCanvasElement | null>(null);
    const [afbeeldingPreview, setAfbeeldingPreview] = useState<HTMLImageElement | HTMLCanvasElement | null>(null);

    const stageRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const logoInputRef = useRef<HTMLInputElement | null>(null);
    const afbeeldingInputRef = useRef<HTMLInputElement | null>(null);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    const [stageSize, setStageSize] = useState({ width: 960, height: 540 });

    // Throttled resize -> schaal Stage, maar content blijft 1920x1080 basis
    // buiten je useEffect
    const updateSize = useCallback(() => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const scale = containerWidth / 960; 
      setStageSize({ width: containerWidth, height: 540 * scale });
    }, []);

    const onResize = useRafThrottle(updateSize);

    useEffect(() => {
      updateSize(); // initial call
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, [onResize, updateSize]);


    // Slim afbeeldingen laden (preview)
    useEffect(() => {
      let cancelled = false;
      (async () => {
        if (!logoUrl) { setLogoPreview(null); return; }
        try {
          const prev = await loadAndDownscale(logoUrl, 512, 512);
          if (!cancelled) setLogoPreview(prev);
        } catch { if (!cancelled) setLogoPreview(null); }
      })();
      return () => { cancelled = true; };
    }, [logoUrl]);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        if (!afbeeldingUrl) { setAfbeeldingPreview(null); return; }
        try {
          const prev = await loadAndDownscale(afbeeldingUrl, 1920, 1080);
          if (!cancelled) setAfbeeldingPreview(prev);
        } catch { if (!cancelled) setAfbeeldingPreview(null); }
      })();
      return () => { cancelled = true; };
    }, [afbeeldingUrl]);

    useEffect(() => {
      let isCancelled = false;
      (async () => {
        const arr = await Promise.all(
          galleryUrls.map(async (url) => {
            if (!url) return null;
            try {
              return await loadAndDownscale(url, 1024, 1024);
            } catch {
              return null;
            }
          })
        );
        if (!isCancelled) setGalleryImages(arr);
      })();
      return () => { isCancelled = true; };
    }, [galleryUrls]);

    const handleFileUpload = useCallback((file: File, setter: (data: string) => void) => {
      const reader = new FileReader();
      reader.onload = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }, []);

    const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file, setLogoUrl);
    }, [handleFileUpload]);

    const handleAfbeeldingUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file, setAfbeeldingUrl);
    }, [handleFileUpload]);

    const handleGalleryUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const files: File[] = Array.from(e.target.files || []);
      if (!files.length) return;
      const readers = files.map(
        (f) => new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.readAsDataURL(f);
        })
      );
      Promise.all(readers).then((urls) => setGalleryUrls((prev) => [...prev, ...urls]));
    }, []);

    const recalculateRowPositions = useCallback((rows: TableRow[]): TableRow[] => {
      const getValue = (row: TableRow, label: string) => {
        const index = columns.indexOf(label);
        return index >= 0 ? parseInt(row.values[index]) || 0 : 0;
      };
      const sorted = [...rows].sort((a, b) => {
        const ptsA = getValue(a, "PTS");
        const ptsB = getValue(b, "PTS");
        const gdA = getValue(a, "DV") - getValue(a, "DT");
        const gdB = getValue(b, "DV") - getValue(b, "DT");
        const dvA = getValue(a, "DV");
        const dvB = getValue(b, "DV");
        if (ptsA !== ptsB) return ptsB - ptsA;
        if (gdA !== gdB) return gdB - gdA;
        return dvB - dvA;
      });
      return sorted.map((row, index) => ({
        ...row,
        values: [String(index + 1), ...row.values.slice(1)],
        y: 140 + index * 30,
      }));
    }, [columns]);

    const setTableRowsDebounced = useRafDebounce((rows: TableRow[]) => {
      setTableRows(recalculateRowPositions(rows));
    });

    const confirmAddRow = useCallback(() => {
      const newRow: TableRow = {
        id: Date.now().toString(),
        values: ["", ...newRowValues.slice(1)],
        y: 0,
        isMyTeam,
      };
      const updated = [...tableRows, newRow];
      setTableRowsDebounced(updated);
      setShowInputPopup(false);
      setNewRowValues(columns.map(() => ""));
      setIsMyTeam(false);
    }, [columns, isMyTeam, newRowValues, tableRows, setTableRowsDebounced]);

    const handleDeleteRow = useCallback((id: string) => {
      const updated = tableRows.filter((row) => row.id !== id);
      setTableRowsDebounced(updated);
    }, [tableRows, setTableRowsDebounced]);

    const handleTemplateChange = useCallback((newTemplate: TemplateType) => {
      setShowInputPopup(false);
      setIsMyTeam(false);

      setAfbeeldingUrl(null);

      setHomeTeam("");
      setAwayTeam("");
      setMatchDate("");
      setMatchTime("");
      setAddress("");

      setGalleryUrls([]);
      setGalleryCols(defaultGalleryCols);
      setGalleryGap(defaultGalleryGap);
      setGalleryPadding(defaultGalleryPadding);
      setGalleryTitle("");

      setTableRows([]);

      setTemplateType(newTemplate);
    }, [defaultGalleryCols, defaultGalleryGap, defaultGalleryPadding]);

    const templateNode = useMemo(() => {
      if (templateType === "uitslagen") {
        return renderUitslagenTable(columns, tableRows, {
          headerFill: stripeColor2,
          rowFill: stripeColor1,
        });
      }
      if (templateType === "afbeelding")
        return renderAfbeeldingTemplate(afbeeldingPreview as any);
      if (templateType === "upcoming")
        return renderUpcomingGameTemplate({
          homeTeam,
          awayTeam,
          date: matchDate,
          time: matchTime,
          address,
          image: afbeeldingPreview as any,
          accent1: stripeColor1,
          accent2: stripeColor2,
        });
      if (templateType === "fotogalerij")
        return renderFotogalerijTemplate({
          images: galleryImages as any,
          cols: galleryCols,
          gap: galleryGap,
          padding: galleryPadding,
          title: galleryTitle,
          accent1: stripeColor1,
          accent2: stripeColor2,
          rounded: 16,
        });
      return null;
    }, [templateType, columns, tableRows, stripeColor1, stripeColor2, afbeeldingPreview, homeTeam, awayTeam, matchDate, matchTime, address, galleryImages, galleryCols, galleryGap, galleryPadding, galleryTitle]);

    // ------------- export 4K zonder stage-resize -------------
    useImperativeHandle(ref, () => {
      const exportAsImage = () => {
        if (!stageRef.current) return;
        // Render op 2× pixelRatio -> 3840×2160 uit 1920×1080
        return stageRef.current.toDataURL({ mimeType: "image/png", pixelRatio: 2 });
      };

      const exportState = () => {
        const imageDataUrl = exportAsImage();
        return {
          imageDataUrl,
          type: templateType,
          backgroundColor,
          stripeColor1,
          stripeColor2,
          columns,
          tableRows,
          afbeeldingUrl,
          homeTeam,
          awayTeam,
          matchDate,
          matchTime,
          address,
          logoUrl,
          galleryUrls,
          galleryCols,
          galleryGap,
          galleryPadding,
          galleryTitle,
        };
      };

      return { exportAsImage, exportState };
    });

    return (
      <div className="c-canvas-editor">
        <div className="c-controls-grid">
          <div className="c-canvas-editor__controls">
            <label className="form-label mb-0">Template</label>
            <select
              value={templateType}
              onChange={(e) => handleTemplateChange(e.target.value as TemplateType)}
              className="form-select w-auto"
            >
              <option value="none">Geen</option>
              <option value="uitslagen">Uitslagen</option>
              <option value="afbeelding">Afbeelding</option>
              <option value="upcoming">Volgende match</option>
              <option value="fotogalerij">Fotogalerij</option>
            </select>

            {templateType === "uitslagen" && (
              <button type="button" onClick={() => setShowInputPopup(true)} className="btn btn-outline-success">
                Voeg team toe
              </button>
            )}
          </div>

          <div className="c-canvas-editor__controls">
            <label className="form-label mb-0">Uploads</label>

            <button type="button" onClick={() => logoInputRef.current?.click()} className="btn btn-outline-primary">
              Upload logo
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: "none" }}
            />

            {(templateType === "afbeelding" || templateType === "upcoming") && (
              <>
                <button type="button" onClick={() => afbeeldingInputRef.current?.click()} className="btn btn-outline-primary">
                  Upload afbeelding
                </button>
                <input
                  ref={afbeeldingInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAfbeeldingUpload}
                  style={{ display: "none" }}
                />
              </>
            )}

            {templateType === "fotogalerij" && (
              <>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="btn btn-outline-primary"
                >
                  Upload afbeeldingen
                </button>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  style={{ display: "none" }}
                />
              </>
            )}
          </div>

          <div className="c-canvas-editor__controls">
            <label className="form-label mb-0">Achtergrond</label>
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />

            <label className="form-label mb-0">Accent 1</label>
            <input type="color" value={stripeColor1} onChange={(e) => setStripeColor1(e.target.value)} />

            <label className="form-label mb-0">Accent 2</label>
            <input type="color" value={stripeColor2} onChange={(e) => setStripeColor2(e.target.value)} />
          </div>
        </div>

        <div ref={containerRef} className="c-canvas-editor__stage-container">
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            scaleX={stageSize.width / 1920}
            scaleY={stageSize.height / 1080}
            ref={stageRef}
            className="mb-3"
          >
            <Layer
              listening={false}
              hitGraphEnabled={false}
              perfectDrawEnabled={false}
              shadowForStrokeEnabled={false}
            >
              <Rect width={1920} height={1080} fill={backgroundColor} />
              <Line points={[0, 120, 0, 260, 260, 0, 120, 0]} fill={stripeColor1} closed />
              <Line points={[0, 260, 0, 360, 360, 0, 260, 0]} fill={stripeColor2} closed />
              {logoUrl && logoPreview && (
                <KonvaImage image={logoPreview as any} x={1740} y={910} width={160} height={160} listening={false} />
              )}
            </Layer>

            {templateType === "fotogalerij" ? (
              <FastLayer listening={false} hitGraphEnabled={false}>
                {templateNode}
              </FastLayer>
            ) : (
              <Layer listening={false} hitGraphEnabled={false}>
                {templateNode}
              </Layer>
            )}
          </Stage>
        </div>

        {templateType === "upcoming" && (
          <div className="c-canvas-editor__controls">
            <input
              className="form-control c-canvas-editor__input"
              placeholder="Thuisploeg"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
            />
            <input
              className="form-control c-canvas-editor__input"
              placeholder="Uitploeg"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
            />
            <input
              className="form-control c-canvas-editor__input"
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
            />
            <input
              className="form-control c-canvas-editor__input"
              type="time"
              value={matchTime}
              onChange={(e) => setMatchTime(e.target.value)}
            />
            <input
              className="form-control c-canvas-editor__input"
              placeholder="Adres"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        )}

        {templateType === "fotogalerij" && (
          <>
            <div className="c-canvas-editor__controls d-flex flex-wrap gap-3 align-items-center justify-content-center">
              <label className="form-label mb-0">Kolommen:</label>
              <input
                type="number"
                className="form-control c-canvas-editor__input"
                style={{ width: 90 }}
                min={1}
                max={12}
                value={galleryCols}
                onChange={(e) => setGalleryCols(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
              />
              <label className="form-label mb-0">Gap (px):</label>
              <input
                type="number"
                className="form-control c-canvas-editor__input"
                style={{ width: 90 }}
                min={0}
                max={200}
                value={galleryGap}
                onChange={(e) => setGalleryGap(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <label className="form-label mb-0">Padding (px):</label>
              <input
                type="number"
                className="form-control c-canvas-editor__input"
                style={{ width: 90 }}
                min={0}
                max={400}
                value={galleryPadding}
                onChange={(e) => setGalleryPadding(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <input
                className="form-control c-canvas-editor__input"
                placeholder="Titel (optioneel)"
                value={galleryTitle}
                onChange={(e) => setGalleryTitle(e.target.value)}
              />
            </div>

            <div className="c-canvas-editor__rows pb-4">
              <h5>Afbeeldingen ({galleryUrls.length})</h5>
              <div className="d-flex flex-wrap gap-2">
                {galleryUrls.map((u, i) => (
                  <div key={i} className="position-relative" style={{ width: 100, height: 72 }}>
                    <img
                      src={u}
                      alt={`img-${i}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger position-absolute"
                      style={{ top: 2, right: 2 }}
                      onClick={() => setGalleryUrls((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {galleryUrls.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setGalleryUrls([])}
                  >
                    Alles wissen
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {templateType === "uitslagen" && (
          <div className="c-canvas-editor__rows">
            {tableRows.map((row, rowIndex) => (
              <div key={row.id} className="d-flex flex-wrap align-items-center gap-2 mb-5">
                {columns.map((col, colIndex) => (
                  <input
                    key={colIndex}
                    className="form-control c-canvas-editor__input gap-2"
                    style={{ width: "190px" }}
                    placeholder={col}
                    value={row.values[colIndex] || ""}
                    onChange={(e) => {
                      const updated = [...tableRows];
                      updated[rowIndex] = { ...updated[rowIndex], values: [...updated[rowIndex].values] };
                      updated[rowIndex].values[colIndex] = e.target.value;
                      setTableRowsDebounced(updated);
                    }}
                  />
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteRow(row.id)}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))}

            {showInputPopup && (
              <div className="c-canvas-editor__popup">
                <h2>Nieuw team toevoegen</h2>
                <div className="d-flex flex-wrap gap-2">
                  {columns.map((col, index) => (
                    <input
                      key={index}
                      className="form-control c-canvas-editor__input"
                      placeholder={col}
                      value={newRowValues[index]}
                      onChange={(e) => {
                        const newValues = [...newRowValues];
                        newValues[index] = e.target.value;
                        setNewRowValues(newValues);
                      }}
                    />
                  ))}

                  <div className="form-check mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isMyTeam"
                      checked={isMyTeam}
                      onChange={() => setIsMyTeam(!isMyTeam)}
                    />
                    <label className="form-check-label" htmlFor="isMyTeam">
                      Is dit jouw ploeg?
                    </label>
                  </div>
                </div>

                <div className="mt-2 d-flex gap-2">
                  <button type="button" onClick={confirmAddRow} className="btn btn-success btn-sm">
                    Bevestig
                  </button>
                  <button type="button" onClick={() => setShowInputPopup(false)} className="btn btn-secondary btn-sm">
                    Annuleer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default CanvasEditor;
