/// <reference types="react" />
import { DefaultHeatMapDatum, HeatMapDatum, HeatMapSvgProps } from './types';
export declare const ResponsiveHeatMap: <Datum extends HeatMapDatum = DefaultHeatMapDatum, ExtraProps extends object = Record<string, never>>(props: Omit<HeatMapSvgProps<Datum, ExtraProps>, "width" | "height">) => JSX.Element;
//# sourceMappingURL=ResponsiveHeatMap.d.ts.map