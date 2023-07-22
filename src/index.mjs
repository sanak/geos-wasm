import { initCFunctions, GEOSFunctions } from './allCFunctions.mjs';
import allJsFunctions from './allJsFunctions.mjs';
import CModule from '../build/package/geos.js';

let geosJsPromise;

export default function initGeosJs(
  config = {},
) {
  if (geosJsPromise) return geosJsPromise;
  geosJsPromise = new Promise((resolve, reject) => {
    const Module = GEOSFunctions.Module;

    Module.print = function p(text) {
      console.debug(`geos stdout: ${text}`);
    };

    Module.printErr = function p(text) {
      console.error(`geos stderr: ${text}`);
    };

    Module.onRuntimeInitialized = function onRuntimeInitialized() {
      try {
        initCFunctions();
        GEOSFunctions.init();
        GEOSFunctions.setNoticeMessageHandler(function(msg, userData) {
          const msgStr = Module.UTF8ToString(msg);
          console.debug('geos notice:', msgStr);
          // Module.HEAPU8.set(msg, userData); // Doesn't work
          const size = Module.lengthBytesUTF8(msgStr) + 1;
          Module.stringToUTF8(msgStr, userData, size)
        });
        GEOSFunctions.setErrorMessageHandler(function(msg, userData) {
          const msgStr = Module.UTF8ToString(msg);
          console.error('geos error:', msgStr);
          // Module.HEAPU8.set(msg, userData); // Doesn't work
          const size = Module.lengthBytesUTF8(msgStr) + 1;
          Module.stringToUTF8(msgStr, userData, size)
        });
      } catch (error) {
        console.log('error initializing geos.js', error);
      }
    };

    Module.destroy = function destroy() {
      /* Clean up the global context */
      GEOSFunctions.finish();
    }


    Module.locateFile = config.locateFile;

    CModule(GEOSFunctions.Module).then((res) => {
      resolve(allJsFunctions);
    });
  });
  return geosJsPromise;
}
