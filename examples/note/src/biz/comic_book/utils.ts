// import { FlipBook, TheElementSupportJQuery } from "./index";

import { ElementJQueryLikeCore } from "./element";

type Point2D = {
  x: number;
  y: number;
};

let has3d = true;
// let vendor = "";

/**
 * Gets basic attributes for a layer
 * @param top - Top position
 * @param left - Left position
 * @param zIndex - Z-index value
 * @param overf - Overflow value
 * @returns CSS attributes object
 */
export function divAtt(top: number, left: number, zIndex?: number | string, overf?: string) {
  return {
    css: {
      position: "absolute",
      top: top,
      left: left,
      overflow: overf || "hidden",
      "z-index": zIndex || "auto",
    },
  };
}

/**
 * Gets a 2D point from a bezier curve of four points
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - Third control point
 * @param p4 - Fourth control point
 * @param t - Time parameter (0-1)
 * @returns Point2D coordinates
 */
export function bezier(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D, t: number) {
  var mum1 = 1 - t,
    mum13 = mum1 * mum1 * mum1,
    mu3 = t * t * t;

  return point2D(
    Math.round(mum13 * p1.x + 3 * t * mum1 * mum1 * p2.x + 3 * t * t * mum1 * p3.x + mu3 * p4.x),
    Math.round(mum13 * p1.y + 3 * t * mum1 * mum1 * p2.y + 3 * t * t * mum1 * p3.y + mu3 * p4.y)
  );
}

/**
 * Converts an angle from degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function rad(degrees: number): number {
  return (degrees / 180) * Math.PI;
}

/**
 * Converts an angle from radians to degrees
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
export function deg(radians: number): number {
  return (radians / Math.PI) * 180;
}

/**
 * Creates a 2D point
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Point2D object
 */
export function point2D(x: number, y: number): Point2D {
  return { x: x, y: y };
}

/**
 * Returns the translate transform value
 * @param x - X translation
 * @param y - Y translation
 * @param use3d - Whether to use 3D transform
 * @returns Transform string
 */
export function translate(x: number, y: number, use3d?: boolean): string {
  return has3d && use3d ? " translate3d(" + x + "px," + y + "px, 0px) " : " translate(" + x + "px, " + y + "px) ";
}

/**
 * Returns the rotation transform value
 * @param degrees - Rotation angle in degrees
 * @returns Transform string
 */
export function rotate(degrees: number): string {
  return " rotate(" + degrees + "deg) ";
}

/**
 * Checks if a property belongs to an object
 * @param property - Property name to check
 * @param object - Object to check against
 * @returns Boolean indicating if property exists
 */
export function has(property: string, object: object): boolean {
  return Object.prototype.hasOwnProperty.call(object, property);
}

/**
 * Gets the CSS3 vendor prefix
 * @returns Vendor prefix string
 */
export function getPrefix(): string {
  var vendorPrefixes = ["Moz", "Webkit", "Khtml", "O", "ms"],
    len = vendorPrefixes.length,
    vendor = "";

  while (len--)
    if (vendorPrefixes[len] + "Transform" in document.body.style)
      vendor = "-" + vendorPrefixes[len].toLowerCase() + "-";

  return vendor;
}
const vendor = "-webkit-";
/**
 * Adds gradients to an element
 * @param obj - jQuery object
 * @param p0 - Start point
 * @param p1 - End point
 * @param colors - Array of color stops
 * @param numColors - Number of colors
 */
export function gradient(
  obj: ElementJQueryLikeCore,
  p0: Point2D,
  p1: Point2D,
  colors: [number, string][],
  numColors: number
): void {
  var j,
    cols = [];

  if (vendor == "-webkit-") {
    for (j = 0; j < numColors; j++) {
      cols.push("color-stop(" + colors[j][0] + ", " + colors[j][1] + ")");
    }

    obj.css({
      "background-image":
        "-webkit-gradient(linear, " + p0.x + "% " + p0.y + "%,  " + p1.x + "% " + p1.y + "%, " + cols.join(",") + " )",
    });
  } else {
    // This procedure makes the gradients for non-webkit browsers
    // It will be reduced to one unique way for gradients in next versions

    p0 = { x: (p0.x / 100) * obj.width(), y: (p0.y / 100) * obj.height() };
    p1 = { x: (p1.x / 100) * obj.width(), y: (p1.y / 100) * obj.height() };

    var dx = p1.x - p0.x,
      dy = p1.y - p0.y,
      angle = Math.atan2(dy, dx),
      angle2 = angle - Math.PI / 2,
      diagonal = Math.abs(obj.width() * Math.sin(angle2)) + Math.abs(obj.height() * Math.cos(angle2)),
      gradientDiagonal = Math.sqrt(dy * dy + dx * dx),
      corner = point2D(p1.x < p0.x ? obj.width() : 0, p1.y < p0.y ? obj.height() : 0),
      slope = Math.tan(angle),
      inverse = -1 / slope,
      x = (inverse * corner.x - corner.y - slope * p0.x + p0.y) / (inverse - slope),
      c = { x: x, y: inverse * x - inverse * corner.x + corner.y },
      segA = Math.sqrt(Math.pow(c.x - p0.x, 2) + Math.pow(c.y - p0.y, 2));

    for (j = 0; j < numColors; j++) {
      cols.push(" " + colors[j][1] + " " + ((segA + gradientDiagonal * colors[j][0]) * 100) / diagonal + "%");
    }

    obj.css({ "background-image": vendor + "linear-gradient(" + -angle + "rad," + cols.join(",") + ")" });
  }
}
