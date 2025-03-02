/// <reference types="react" />
import { DefaultHeatMapDatum, HeatMapCanvasProps, HeatMapDatum } from './types';
export declare const ResponsiveHeatMapCanvas: <Datum extends HeatMapDatum = DefaultHeatMapDatum, ExtraProps extends object = Record<string, never>>(props: Omit<HeatMapCanvasProps<Datum, ExtraProps>, "width" | "height">) => JSX.Element;
//# sourceMappingURL=ResponsiveHeatMapCanvas.d.ts.map