declare module "react-webcam" {
  import * as React from "react";

  // interface yang kita butuhkan (getScreenshot)
  export interface ReactWebcamInstance {
    getScreenshot: (width?: number, height?: number) => string | null;
  }

  // Komponen Webcam sebagai React component dengan instance type di atas
  const Webcam: React.ComponentType<React.ComponentProps<any>> & {
    prototype: ReactWebcamInstance;
  };

  export default Webcam;
}
