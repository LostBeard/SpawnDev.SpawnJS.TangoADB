var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/yuv-buffer/yuv-buffer.js
var require_yuv_buffer = __commonJS({
  "node_modules/yuv-buffer/yuv-buffer.js"(exports, module) {
    var YUVBuffer = {
      /**
       * Validate a plane dimension
       * @param {number} dim - vertical or horizontal dimension
       * @throws exception on zero, negative, or non-integer value
       */
      validateDimension: function(dim) {
        if (dim <= 0 || dim !== (dim | 0)) {
          throw "YUV plane dimensions must be a positive integer";
        }
      },
      /**
       * Validate a plane offset
       * @param {number} dim - vertical or horizontal dimension
       * @throws exception on negative or non-integer value
       */
      validateOffset: function(dim) {
        if (dim < 0 || dim !== (dim | 0)) {
          throw "YUV plane offsets must be a non-negative integer";
        }
      },
      /**
       * Validate and fill out a YUVFormat object structure.
       *
       * At least width and height fields are required; other fields will be
       * derived if left missing or empty:
       * - chromaWidth and chromaHeight will be copied from width and height as for a 4:4:4 layout
       * - cropLeft and cropTop will be 0
       * - cropWidth and cropHeight will be set to whatever of the frame is visible after cropTop and cropLeft are applied
       * - displayWidth and displayHeight will be set to cropWidth and cropHeight.
       *
       * @param {YUVFormat} fields - input fields, must include width and height.
       * @returns {YUVFormat} - validated structure, with all derivable fields filled out.
       * @throws exception on invalid fields or missing width/height
       */
      format: function(fields) {
        var width = fields.width, height = fields.height, chromaWidth = fields.chromaWidth || width, chromaHeight = fields.chromaHeight || height, cropLeft = fields.cropLeft || 0, cropTop = fields.cropTop || 0, cropWidth = fields.cropWidth || width - cropLeft, cropHeight = fields.cropHeight || height - cropTop, displayWidth = fields.displayWidth || cropWidth, displayHeight = fields.displayHeight || cropHeight;
        this.validateDimension(width);
        this.validateDimension(height);
        this.validateDimension(chromaWidth);
        this.validateDimension(chromaHeight);
        this.validateOffset(cropLeft);
        this.validateOffset(cropTop);
        this.validateDimension(cropWidth);
        this.validateDimension(cropHeight);
        this.validateDimension(displayWidth);
        this.validateDimension(displayHeight);
        return {
          width,
          height,
          chromaWidth,
          chromaHeight,
          cropLeft,
          cropTop,
          cropWidth,
          cropHeight,
          displayWidth,
          displayHeight
        };
      },
      /**
       * Pick a suitable stride for a custom-allocated thingy
       * @param {number} width - width in bytes
       * @returns {number} - new width in bytes at least as large
       * @throws exception on invalid input width
       */
      suitableStride: function(width) {
        YUVBuffer.validateDimension(width);
        var alignment = 4, remainder = width % alignment;
        if (remainder == 0) {
          return width;
        } else {
          return width + (alignment - remainder);
        }
      },
      /**
       * Allocate or extract a YUVPlane object from given dimensions/source.
       * @param {number} width - width in pixels
       * @param {number} height - height in pixels
       * @param {Uint8Array} source - input byte array; optional (will create empty buffer if missing)
       * @param {number} stride - row length in bytes; optional (will create a default if missing)
       * @param {number} offset - offset into source array to extract; optional (will start at 0 if missing)
       * @returns {YUVPlane} - freshly allocated planar buffer
       */
      allocPlane: function(width, height, source, stride, offset) {
        var size, bytes;
        this.validateDimension(width);
        this.validateDimension(height);
        offset = offset || 0;
        stride = stride || this.suitableStride(width);
        this.validateDimension(stride);
        if (stride < width) {
          throw "Invalid input stride for YUV plane; must be larger than width";
        }
        size = stride * height;
        if (source) {
          if (source.length - offset < size) {
            throw "Invalid input buffer for YUV plane; must be large enough for stride times height";
          }
          bytes = source.slice(offset, offset + size);
        } else {
          bytes = new Uint8Array(size);
          stride = stride || this.suitableStride(width);
        }
        return {
          bytes,
          stride
        };
      },
      /**
       * Allocate a new YUVPlane object big enough for a luma plane in the given format
       * @param {YUVFormat} format - target frame format
       * @param {Uint8Array} source - input byte array; optional (will create empty buffer if missing)
       * @param {number} stride - row length in bytes; optional (will create a default if missing)
       * @param {number} offset - offset into source array to extract; optional (will start at 0 if missing)
       * @returns {YUVPlane} - freshly allocated planar buffer
       */
      lumaPlane: function(format, source, stride, offset) {
        return this.allocPlane(format.width, format.height, source, stride, offset);
      },
      /**
       * Allocate a new YUVPlane object big enough for a chroma plane in the given format,
       * optionally copying data from an existing buffer.
       *
       * @param {YUVFormat} format - target frame format
       * @param {Uint8Array} source - input byte array; optional (will create empty buffer if missing)
       * @param {number} stride - row length in bytes; optional (will create a default if missing)
       * @param {number} offset - offset into source array to extract; optional (will start at 0 if missing)
       * @returns {YUVPlane} - freshly allocated planar buffer
       */
      chromaPlane: function(format, source, stride, offset) {
        return this.allocPlane(format.chromaWidth, format.chromaHeight, source, stride, offset);
      },
      /**
       * Allocate a new YUVFrame object big enough for the given format
       * @param {YUVFormat} format - target frame format
       * @param {YUVPlane} y - optional Y plane; if missing, fresh one will be allocated
       * @param {YUVPlane} u - optional U plane; if missing, fresh one will be allocated
       * @param {YUVPlane} v - optional V plane; if missing, fresh one will be allocated
       * @returns {YUVFrame} - freshly allocated frame buffer
       */
      frame: function(format, y, u, v) {
        y = y || this.lumaPlane(format);
        u = u || this.chromaPlane(format);
        v = v || this.chromaPlane(format);
        return {
          format,
          y,
          u,
          v
        };
      },
      /**
       * Duplicate a plane using new buffer memory.
       * @param {YUVPlane} plane - input plane to copy
       * @returns {YUVPlane} - freshly allocated and filled planar buffer
       */
      copyPlane: function(plane) {
        return {
          bytes: plane.bytes.slice(),
          stride: plane.stride
        };
      },
      /**
       * Duplicate a frame using new buffer memory.
       * @param {YUVFrame} frame - input frame to copyFrame
       * @returns {YUVFrame} - freshly allocated and filled frame buffer
       */
      copyFrame: function(frame) {
        return {
          format: frame.format,
          y: this.copyPlane(frame.y),
          u: this.copyPlane(frame.u),
          v: this.copyPlane(frame.v)
        };
      },
      /**
       * List the backing buffers for the frame's planes for transfer between
       * threads via Worker.postMessage.
       * @param {YUVFrame} frame - input frame
       * @returns {Array} - list of transferable objects
       */
      transferables: function(frame) {
        return [frame.y.bytes.buffer, frame.u.bytes.buffer, frame.v.bytes.buffer];
      }
    };
    module.exports = YUVBuffer;
  }
});

// node_modules/yuv-canvas/src/FrameSink.js
var require_FrameSink = __commonJS({
  "node_modules/yuv-canvas/src/FrameSink.js"(exports, module) {
    (function() {
      "use strict";
      function FrameSink(canvas, options) {
        throw new Error("abstract");
      }
      FrameSink.prototype.drawFrame = function(buffer2) {
        throw new Error("abstract");
      };
      FrameSink.prototype.clear = function() {
        throw new Error("abstract");
      };
      module.exports = FrameSink;
    })();
  }
});

// node_modules/yuv-canvas/src/depower.js
var require_depower = __commonJS({
  "node_modules/yuv-canvas/src/depower.js"(exports, module) {
    (function() {
      "use strict";
      function depower(ratio) {
        var shiftCount = 0, n = ratio >> 1;
        while (n != 0) {
          n = n >> 1;
          shiftCount++;
        }
        if (ratio !== 1 << shiftCount) {
          throw "chroma plane dimensions must be power of 2 ratio to luma plane dimensions; got " + ratio;
        }
        return shiftCount;
      }
      module.exports = depower;
    })();
  }
});

// node_modules/yuv-canvas/src/YCbCr.js
var require_YCbCr = __commonJS({
  "node_modules/yuv-canvas/src/YCbCr.js"(exports, module) {
    (function() {
      "use strict";
      var depower = require_depower();
      function convertYCbCr(buffer2, output) {
        var width = buffer2.format.width | 0, height = buffer2.format.height | 0, hdec = depower(buffer2.format.width / buffer2.format.chromaWidth) | 0, vdec = depower(buffer2.format.height / buffer2.format.chromaHeight) | 0, bytesY = buffer2.y.bytes, bytesCb = buffer2.u.bytes, bytesCr = buffer2.v.bytes, strideY = buffer2.y.stride | 0, strideCb = buffer2.u.stride | 0, strideCr = buffer2.v.stride | 0, outStride = width << 2, YPtr = 0, Y0Ptr = 0, Y1Ptr = 0, CbPtr = 0, CrPtr = 0, outPtr = 0, outPtr0 = 0, outPtr1 = 0, colorCb = 0, colorCr = 0, multY = 0, multCrR = 0, multCbCrG = 0, multCbB = 0, x = 0, y = 0, xdec = 0, ydec = 0;
        if (hdec == 1 && vdec == 1) {
          outPtr0 = 0;
          outPtr1 = outStride;
          ydec = 0;
          for (y = 0; y < height; y += 2) {
            Y0Ptr = y * strideY | 0;
            Y1Ptr = Y0Ptr + strideY | 0;
            CbPtr = ydec * strideCb | 0;
            CrPtr = ydec * strideCr | 0;
            for (x = 0; x < width; x += 2) {
              colorCb = bytesCb[CbPtr++] | 0;
              colorCr = bytesCr[CrPtr++] | 0;
              multCrR = (409 * colorCr | 0) - 57088 | 0;
              multCbCrG = (100 * colorCb | 0) + (208 * colorCr | 0) - 34816 | 0;
              multCbB = (516 * colorCb | 0) - 70912 | 0;
              multY = 298 * bytesY[Y0Ptr++] | 0;
              output[outPtr0] = multY + multCrR >> 8;
              output[outPtr0 + 1] = multY - multCbCrG >> 8;
              output[outPtr0 + 2] = multY + multCbB >> 8;
              outPtr0 += 4;
              multY = 298 * bytesY[Y0Ptr++] | 0;
              output[outPtr0] = multY + multCrR >> 8;
              output[outPtr0 + 1] = multY - multCbCrG >> 8;
              output[outPtr0 + 2] = multY + multCbB >> 8;
              outPtr0 += 4;
              multY = 298 * bytesY[Y1Ptr++] | 0;
              output[outPtr1] = multY + multCrR >> 8;
              output[outPtr1 + 1] = multY - multCbCrG >> 8;
              output[outPtr1 + 2] = multY + multCbB >> 8;
              outPtr1 += 4;
              multY = 298 * bytesY[Y1Ptr++] | 0;
              output[outPtr1] = multY + multCrR >> 8;
              output[outPtr1 + 1] = multY - multCbCrG >> 8;
              output[outPtr1 + 2] = multY + multCbB >> 8;
              outPtr1 += 4;
            }
            outPtr0 += outStride;
            outPtr1 += outStride;
            ydec++;
          }
        } else {
          outPtr = 0;
          for (y = 0; y < height; y++) {
            xdec = 0;
            ydec = y >> vdec;
            YPtr = y * strideY | 0;
            CbPtr = ydec * strideCb | 0;
            CrPtr = ydec * strideCr | 0;
            for (x = 0; x < width; x++) {
              xdec = x >> hdec;
              colorCb = bytesCb[CbPtr + xdec] | 0;
              colorCr = bytesCr[CrPtr + xdec] | 0;
              multCrR = (409 * colorCr | 0) - 57088 | 0;
              multCbCrG = (100 * colorCb | 0) + (208 * colorCr | 0) - 34816 | 0;
              multCbB = (516 * colorCb | 0) - 70912 | 0;
              multY = 298 * bytesY[YPtr++] | 0;
              output[outPtr] = multY + multCrR >> 8;
              output[outPtr + 1] = multY - multCbCrG >> 8;
              output[outPtr + 2] = multY + multCbB >> 8;
              outPtr += 4;
            }
          }
        }
      }
      module.exports = {
        convertYCbCr
      };
    })();
  }
});

// node_modules/yuv-canvas/src/SoftwareFrameSink.js
var require_SoftwareFrameSink = __commonJS({
  "node_modules/yuv-canvas/src/SoftwareFrameSink.js"(exports, module) {
    (function() {
      "use strict";
      var FrameSink = require_FrameSink(), YCbCr = require_YCbCr();
      function SoftwareFrameSink(canvas) {
        var self = this, ctx = canvas.getContext("2d"), imageData = null, resampleCanvas = null, resampleContext = null;
        function initImageData(width, height) {
          imageData = ctx.createImageData(width, height);
          var data = imageData.data, pixelCount = width * height * 4;
          for (var i = 0; i < pixelCount; i += 4) {
            data[i + 3] = 255;
          }
        }
        function initResampleCanvas(cropWidth, cropHeight) {
          resampleCanvas = document.createElement("canvas");
          resampleCanvas.width = cropWidth;
          resampleCanvas.height = cropHeight;
          resampleContext = resampleCanvas.getContext("2d");
        }
        self.drawFrame = function drawFrame(buffer2) {
          var format = buffer2.format;
          if (canvas.width !== format.displayWidth || canvas.height !== format.displayHeight) {
            canvas.width = format.displayWidth;
            canvas.height = format.displayHeight;
          }
          if (imageData === null || imageData.width != format.width || imageData.height != format.height) {
            initImageData(format.width, format.height);
          }
          YCbCr.convertYCbCr(buffer2, imageData.data);
          var resample = format.cropWidth != format.displayWidth || format.cropHeight != format.displayHeight;
          var drawContext;
          if (resample) {
            if (!resampleCanvas) {
              initResampleCanvas(format.cropWidth, format.cropHeight);
            }
            drawContext = resampleContext;
          } else {
            drawContext = ctx;
          }
          drawContext.putImageData(
            imageData,
            -format.cropLeft,
            -format.cropTop,
            // must offset the offset
            format.cropLeft,
            format.cropTop,
            format.cropWidth,
            format.cropHeight
          );
          if (resample) {
            ctx.drawImage(resampleCanvas, 0, 0, format.displayWidth, format.displayHeight);
          }
        };
        self.clear = function() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        return self;
      }
      SoftwareFrameSink.prototype = Object.create(FrameSink.prototype);
      module.exports = SoftwareFrameSink;
    })();
  }
});

// node_modules/yuv-canvas/build/shaders.js
var require_shaders = __commonJS({
  "node_modules/yuv-canvas/build/shaders.js"(exports, module) {
    module.exports = {
      vertex: "precision mediump float;\n\nattribute vec2 aPosition;\nattribute vec2 aLumaPosition;\nattribute vec2 aChromaPosition;\nvarying vec2 vLumaPosition;\nvarying vec2 vChromaPosition;\nvoid main() {\n    gl_Position = vec4(aPosition, 0, 1);\n    vLumaPosition = aLumaPosition;\n    vChromaPosition = aChromaPosition;\n}\n",
      fragment: "// inspired by https://github.com/mbebenita/Broadway/blob/master/Player/canvas.js\n\nprecision mediump float;\n\nuniform sampler2D uTextureY;\nuniform sampler2D uTextureCb;\nuniform sampler2D uTextureCr;\nvarying vec2 vLumaPosition;\nvarying vec2 vChromaPosition;\nvoid main() {\n   // Y, Cb, and Cr planes are uploaded as ALPHA textures.\n   float fY = texture2D(uTextureY, vLumaPosition).w;\n   float fCb = texture2D(uTextureCb, vChromaPosition).w;\n   float fCr = texture2D(uTextureCr, vChromaPosition).w;\n\n   // Premultipy the Y...\n   float fYmul = fY * 1.1643828125;\n\n   // And convert that to RGB!\n   gl_FragColor = vec4(\n     fYmul + 1.59602734375 * fCr - 0.87078515625,\n     fYmul - 0.39176171875 * fCb - 0.81296875 * fCr + 0.52959375,\n     fYmul + 2.017234375   * fCb - 1.081390625,\n     1\n   );\n}\n",
      vertexStripe: "precision mediump float;\n\nattribute vec2 aPosition;\nattribute vec2 aTexturePosition;\nvarying vec2 vTexturePosition;\n\nvoid main() {\n    gl_Position = vec4(aPosition, 0, 1);\n    vTexturePosition = aTexturePosition;\n}\n",
      fragmentStripe: "// extra 'stripe' texture fiddling to work around IE 11's poor performance on gl.LUMINANCE and gl.ALPHA textures\n\nprecision mediump float;\n\nuniform sampler2D uStripe;\nuniform sampler2D uTexture;\nvarying vec2 vTexturePosition;\nvoid main() {\n   // Y, Cb, and Cr planes are mapped into a pseudo-RGBA texture\n   // so we can upload them without expanding the bytes on IE 11\n   // which doesn't allow LUMINANCE or ALPHA textures\n   // The stripe textures mark which channel to keep for each pixel.\n   // Each texture extraction will contain the relevant value in one\n   // channel only.\n\n   float fLuminance = dot(\n      texture2D(uStripe, vTexturePosition),\n      texture2D(uTexture, vTexturePosition)\n   );\n\n   gl_FragColor = vec4(0, 0, 0, fLuminance);\n}\n"
    };
  }
});

// node_modules/yuv-canvas/src/WebGLFrameSink.js
var require_WebGLFrameSink = __commonJS({
  "node_modules/yuv-canvas/src/WebGLFrameSink.js"(exports, module) {
    (function() {
      "use strict";
      var FrameSink = require_FrameSink(), shaders = require_shaders();
      function WebGLFrameSink(canvas) {
        var self = this, gl = WebGLFrameSink.contextForCanvas(canvas), debug = false;
        if (gl === null) {
          throw new Error("WebGL unavailable");
        }
        function checkError() {
          if (debug) {
            err = gl.getError();
            if (err !== 0) {
              throw new Error("GL error " + err);
            }
          }
        }
        function compileShader(type, source) {
          var shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var err2 = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error("GL shader compilation for " + type + " failed: " + err2);
          }
          return shader;
        }
        var program, unpackProgram, err;
        var rectangle = new Float32Array([
          // First triangle (top left, clockwise)
          -1,
          -1,
          1,
          -1,
          -1,
          1,
          // Second triangle (bottom right, clockwise)
          -1,
          1,
          1,
          -1,
          1,
          1
        ]);
        var textures = {};
        var framebuffers = {};
        var stripes = {};
        var buf, positionLocation, unpackPositionLocation;
        var unpackTexturePositionBuffer, unpackTexturePositionLocation;
        var stripeLocation, unpackTextureLocation;
        var lumaPositionBuffer, lumaPositionLocation;
        var chromaPositionBuffer, chromaPositionLocation;
        function createOrReuseTexture(name, formatUpdate) {
          if (!textures[name] || formatUpdate) {
            textures[name] = gl.createTexture();
          }
          return textures[name];
        }
        function uploadTexture(name, formatUpdate, width, height, data) {
          var create = !textures[name] || formatUpdate;
          var texture = createOrReuseTexture(name, formatUpdate);
          gl.activeTexture(gl.TEXTURE0);
          if (WebGLFrameSink.stripe) {
            var uploadTemp = !textures[name + "_temp"] || formatUpdate;
            var tempTexture = createOrReuseTexture(name + "_temp", formatUpdate);
            gl.bindTexture(gl.TEXTURE_2D, tempTexture);
            if (uploadTemp) {
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
              gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                // mip level
                gl.RGBA,
                // internal format
                width / 4,
                height,
                0,
                // border
                gl.RGBA,
                // format
                gl.UNSIGNED_BYTE,
                // type
                data
                // data!
              );
            } else {
              gl.texSubImage2D(
                gl.TEXTURE_2D,
                0,
                // mip level
                0,
                // x offset
                0,
                // y offset
                width / 4,
                height,
                gl.RGBA,
                // format
                gl.UNSIGNED_BYTE,
                // type
                data
                // data!
              );
            }
            var stripeTexture = textures[name + "_stripe"];
            var uploadStripe = !stripeTexture || formatUpdate;
            if (uploadStripe) {
              stripeTexture = createOrReuseTexture(name + "_stripe", formatUpdate);
            }
            gl.bindTexture(gl.TEXTURE_2D, stripeTexture);
            if (uploadStripe) {
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
              gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                // mip level
                gl.RGBA,
                // internal format
                width,
                1,
                0,
                // border
                gl.RGBA,
                // format
                gl.UNSIGNED_BYTE,
                //type
                buildStripe(width, 1)
                // data!
              );
            }
          } else {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            if (create) {
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
              gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                // mip level
                gl.ALPHA,
                // internal format
                width,
                height,
                0,
                // border
                gl.ALPHA,
                // format
                gl.UNSIGNED_BYTE,
                //type
                data
                // data!
              );
            } else {
              gl.texSubImage2D(
                gl.TEXTURE_2D,
                0,
                // mip level
                0,
                // x
                0,
                // y
                width,
                height,
                gl.ALPHA,
                // internal format
                gl.UNSIGNED_BYTE,
                //type
                data
                // data!
              );
            }
          }
        }
        function unpackTexture(name, formatUpdate, width, height) {
          var texture = textures[name];
          gl.useProgram(unpackProgram);
          var fb = framebuffers[name];
          if (!fb || formatUpdate) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              // mip level
              gl.RGBA,
              // internal format
              width,
              height,
              0,
              // border
              gl.RGBA,
              // format
              gl.UNSIGNED_BYTE,
              //type
              null
              // data!
            );
            fb = framebuffers[name] = gl.createFramebuffer();
          }
          gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
          var tempTexture = textures[name + "_temp"];
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, tempTexture);
          gl.uniform1i(unpackTextureLocation, 1);
          var stripeTexture = textures[name + "_stripe"];
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, stripeTexture);
          gl.uniform1i(stripeLocation, 2);
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.enableVertexAttribArray(positionLocation);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, unpackTexturePositionBuffer);
          gl.enableVertexAttribArray(unpackTexturePositionLocation);
          gl.vertexAttribPointer(unpackTexturePositionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.viewport(0, 0, width, height);
          gl.drawArrays(gl.TRIANGLES, 0, rectangle.length / 2);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        function attachTexture(name, register, index) {
          gl.activeTexture(register);
          gl.bindTexture(gl.TEXTURE_2D, textures[name]);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.uniform1i(gl.getUniformLocation(program, name), index);
        }
        function buildStripe(width) {
          if (stripes[width]) {
            return stripes[width];
          }
          var len = width, out = new Uint32Array(len);
          for (var i = 0; i < len; i += 4) {
            out[i] = 255;
            out[i + 1] = 65280;
            out[i + 2] = 16711680;
            out[i + 3] = 4278190080;
          }
          return stripes[width] = new Uint8Array(out.buffer);
        }
        function initProgram(vertexShaderSource, fragmentShaderSource) {
          var vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
          var fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
          var program2 = gl.createProgram();
          gl.attachShader(program2, vertexShader);
          gl.attachShader(program2, fragmentShader);
          gl.linkProgram(program2);
          if (!gl.getProgramParameter(program2, gl.LINK_STATUS)) {
            var err2 = gl.getProgramInfoLog(program2);
            gl.deleteProgram(program2);
            throw new Error("GL program linking failed: " + err2);
          }
          return program2;
        }
        function init() {
          if (WebGLFrameSink.stripe) {
            unpackProgram = initProgram(shaders.vertexStripe, shaders.fragmentStripe);
            unpackPositionLocation = gl.getAttribLocation(unpackProgram, "aPosition");
            unpackTexturePositionBuffer = gl.createBuffer();
            var textureRectangle = new Float32Array([
              0,
              0,
              1,
              0,
              0,
              1,
              0,
              1,
              1,
              0,
              1,
              1
            ]);
            gl.bindBuffer(gl.ARRAY_BUFFER, unpackTexturePositionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, textureRectangle, gl.STATIC_DRAW);
            unpackTexturePositionLocation = gl.getAttribLocation(unpackProgram, "aTexturePosition");
            stripeLocation = gl.getUniformLocation(unpackProgram, "uStripe");
            unpackTextureLocation = gl.getUniformLocation(unpackProgram, "uTexture");
          }
          program = initProgram(shaders.vertex, shaders.fragment);
          buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, rectangle, gl.STATIC_DRAW);
          positionLocation = gl.getAttribLocation(program, "aPosition");
          lumaPositionBuffer = gl.createBuffer();
          lumaPositionLocation = gl.getAttribLocation(program, "aLumaPosition");
          chromaPositionBuffer = gl.createBuffer();
          chromaPositionLocation = gl.getAttribLocation(program, "aChromaPosition");
        }
        self.drawFrame = function(buffer2) {
          var format = buffer2.format;
          var formatUpdate = !program || canvas.width !== format.displayWidth || canvas.height !== format.displayHeight;
          if (formatUpdate) {
            canvas.width = format.displayWidth;
            canvas.height = format.displayHeight;
            self.clear();
          }
          if (!program) {
            init();
          }
          if (formatUpdate) {
            var setupTexturePosition = function(buffer3, location, texWidth) {
              var textureX0 = format.cropLeft / texWidth;
              var textureX1 = (format.cropLeft + format.cropWidth) / texWidth;
              var textureY0 = (format.cropTop + format.cropHeight) / format.height;
              var textureY1 = format.cropTop / format.height;
              var textureRectangle = new Float32Array([
                textureX0,
                textureY0,
                textureX1,
                textureY0,
                textureX0,
                textureY1,
                textureX0,
                textureY1,
                textureX1,
                textureY0,
                textureX1,
                textureY1
              ]);
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer3);
              gl.bufferData(gl.ARRAY_BUFFER, textureRectangle, gl.STATIC_DRAW);
            };
            setupTexturePosition(
              lumaPositionBuffer,
              lumaPositionLocation,
              buffer2.y.stride
            );
            setupTexturePosition(
              chromaPositionBuffer,
              chromaPositionLocation,
              buffer2.u.stride * format.width / format.chromaWidth
            );
          }
          uploadTexture("uTextureY", formatUpdate, buffer2.y.stride, format.height, buffer2.y.bytes);
          uploadTexture("uTextureCb", formatUpdate, buffer2.u.stride, format.chromaHeight, buffer2.u.bytes);
          uploadTexture("uTextureCr", formatUpdate, buffer2.v.stride, format.chromaHeight, buffer2.v.bytes);
          if (WebGLFrameSink.stripe) {
            unpackTexture("uTextureY", formatUpdate, buffer2.y.stride, format.height);
            unpackTexture("uTextureCb", formatUpdate, buffer2.u.stride, format.chromaHeight);
            unpackTexture("uTextureCr", formatUpdate, buffer2.v.stride, format.chromaHeight);
          }
          gl.useProgram(program);
          gl.viewport(0, 0, canvas.width, canvas.height);
          attachTexture("uTextureY", gl.TEXTURE0, 0);
          attachTexture("uTextureCb", gl.TEXTURE1, 1);
          attachTexture("uTextureCr", gl.TEXTURE2, 2);
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.enableVertexAttribArray(positionLocation);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, lumaPositionBuffer);
          gl.enableVertexAttribArray(lumaPositionLocation);
          gl.vertexAttribPointer(lumaPositionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, chromaPositionBuffer);
          gl.enableVertexAttribArray(chromaPositionLocation);
          gl.vertexAttribPointer(chromaPositionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.drawArrays(gl.TRIANGLES, 0, rectangle.length / 2);
        };
        self.clear = function() {
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        };
        self.clear();
        return self;
      }
      WebGLFrameSink.stripe = false;
      WebGLFrameSink.contextForCanvas = function(canvas) {
        var options = {
          // Don't trigger discrete GPU in multi-GPU systems
          preferLowPowerToHighPerformance: true,
          powerPreference: "low-power",
          // Don't try to use software GL rendering!
          failIfMajorPerformanceCaveat: true,
          // In case we need to capture the resulting output.
          preserveDrawingBuffer: true
        };
        return canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);
      };
      WebGLFrameSink.isAvailable = function() {
        var canvas = document.createElement("canvas"), gl;
        canvas.width = 1;
        canvas.height = 1;
        try {
          gl = WebGLFrameSink.contextForCanvas(canvas);
        } catch (e) {
          return false;
        }
        if (gl) {
          var register = gl.TEXTURE0, width = 4, height = 4, texture = gl.createTexture(), data = new Uint8Array(width * height), texWidth = WebGLFrameSink.stripe ? width / 4 : width, format = WebGLFrameSink.stripe ? gl.RGBA : gl.ALPHA, filter = WebGLFrameSink.stripe ? gl.NEAREST : gl.LINEAR;
          gl.activeTexture(register);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            // mip level
            format,
            // internal format
            texWidth,
            height,
            0,
            // border
            format,
            // format
            gl.UNSIGNED_BYTE,
            //type
            data
            // data!
          );
          var err = gl.getError();
          if (err) {
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      };
      WebGLFrameSink.prototype = Object.create(FrameSink.prototype);
      module.exports = WebGLFrameSink;
    })();
  }
});

// node_modules/yuv-canvas/src/yuv-canvas.js
var require_yuv_canvas = __commonJS({
  "node_modules/yuv-canvas/src/yuv-canvas.js"(exports, module) {
    (function() {
      "use strict";
      var FrameSink = require_FrameSink(), SoftwareFrameSink = require_SoftwareFrameSink(), WebGLFrameSink = require_WebGLFrameSink();
      var YUVCanvas = {
        FrameSink,
        SoftwareFrameSink,
        WebGLFrameSink,
        /**
         * Attach a suitable FrameSink instance to an HTML5 canvas element.
         *
         * This will take over the drawing context of the canvas and may turn
         * it into a WebGL 3d canvas if possible. Do not attempt to use the
         * drawing context directly after this.
         *
         * @param {HTMLCanvasElement} canvas - HTML canvas element to attach to
         * @param {YUVCanvasOptions} options - map of options
         * @returns {FrameSink} - instance of suitable subclass.
         */
        attach: function(canvas, options) {
          options = options || {};
          var webGL = "webGL" in options ? options.webGL : WebGLFrameSink.isAvailable();
          if (webGL) {
            return new WebGLFrameSink(canvas, options);
          } else {
            return new SoftwareFrameSink(canvas, options);
          }
        }
      };
      module.exports = YUVCanvas;
    })();
  }
});

// node_modules/@yume-chan/stream-extra/esm/index.js
var esm_exports2 = {};
__export(esm_exports2, {
  AbortController: () => AbortController,
  BufferCombiner: () => BufferCombiner,
  BufferedReadableStream: () => BufferedReadableStream,
  BufferedTransformStream: () => BufferedTransformStream,
  ConcatBufferStream: () => ConcatBufferStream,
  ConcatStringStream: () => ConcatStringStream,
  Consumable: () => Consumable,
  DistributionStream: () => DistributionStream,
  DuplexStreamFactory: () => DuplexStreamFactory,
  InspectStream: () => InspectStream,
  MaybeConsumable: () => maybe_consumable_exports,
  PushReadableStream: () => PushReadableStream,
  ReadableStream: () => ReadableStream2,
  SplitStringStream: () => SplitStringStream,
  StructDeserializeStream: () => StructDeserializeStream,
  StructSerializeStream: () => StructSerializeStream,
  TextDecoderStream: () => TextDecoderStream,
  TextEncoderStream: () => TextEncoderStream,
  TransformStream: () => TransformStream,
  WrapReadableStream: () => WrapReadableStream,
  WrapWritableStream: () => WrapWritableStream,
  WritableStream: () => WritableStream,
  createTask: () => createTask,
  pipeFrom: () => pipeFrom,
  tryCancel: () => tryCancel,
  tryClose: () => tryClose
});

// node_modules/@yume-chan/struct/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  EmptyUint8Array: () => EmptyUint8Array,
  ExactReadableEndedError: () => ExactReadableEndedError,
  StructDeserializeError: () => StructDeserializeError,
  StructEmptyError: () => StructEmptyError,
  StructNotEnoughDataError: () => StructNotEnoughDataError,
  TextDecoder: () => TextDecoder,
  TextEncoder: () => TextEncoder,
  Uint8ArrayExactReadable: () => Uint8ArrayExactReadable,
  bipedal: () => bipedal,
  buffer: () => buffer,
  byobFieldSerializer: () => byobFieldSerializer,
  concat: () => concat,
  decodeUtf8: () => decodeUtf8,
  defaultFieldSerializer: () => defaultFieldSerializer,
  encodeUtf8: () => encodeUtf8,
  extend: () => extend,
  field: () => field,
  s16: () => s16,
  s32: () => s32,
  s64: () => s64,
  s8: () => s8,
  string: () => string,
  struct: () => struct,
  u16: () => u16,
  u32: () => u32,
  u64: () => u64,
  u8: () => u8
});

// node_modules/@yume-chan/async/esm/promise-resolver.js
var PromiseResolver = class {
  #promise;
  get promise() {
    return this.#promise;
  }
  #resolve;
  #reject;
  #state = "running";
  get state() {
    return this.#state;
  }
  constructor() {
    this.#promise = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
  }
  resolve = (value) => {
    this.#resolve(value);
    this.#state = "resolved";
  };
  reject = (reason) => {
    this.#reject(reason);
    this.#state = "rejected";
  };
};

// node_modules/@yume-chan/async/esm/async-operation-manager.js
var AsyncOperationManager = class {
  nextId;
  pendingResolvers = /* @__PURE__ */ new Map();
  constructor(startId = 0) {
    this.nextId = startId;
  }
  add() {
    const id = this.nextId++;
    const resolver = new PromiseResolver();
    this.pendingResolvers.set(id, resolver);
    return [id, resolver.promise];
  }
  getResolver(id) {
    if (!this.pendingResolvers.has(id)) {
      return null;
    }
    const resolver = this.pendingResolvers.get(id);
    this.pendingResolvers.delete(id);
    return resolver;
  }
  resolve(id, result) {
    const resolver = this.getResolver(id);
    if (resolver !== null) {
      resolver.resolve(result);
      return true;
    }
    return false;
  }
  reject(id, reason) {
    const resolver = this.getResolver(id);
    if (resolver !== null) {
      resolver.reject(reason);
      return true;
    }
    return false;
  }
};

// node_modules/@yume-chan/async/esm/delay.js
function delay(time) {
  return new Promise((resolve) => {
    globalThis.setTimeout(() => resolve(), time);
  });
}

// node_modules/@yume-chan/async/esm/maybe-promise.js
function isPromiseLike(value) {
  return typeof value === "object" && value !== null && "then" in value;
}

// node_modules/@yume-chan/struct/esm/bipedal.js
function advance(iterator, next) {
  while (true) {
    const { done, value } = iterator.next(next);
    if (done) {
      return value;
    }
    if (isPromiseLike(value)) {
      return value.then((value2) => advance(iterator, { resolved: value2 }), (error) => advance(iterator, { error }));
    }
    next = value;
  }
}
// @__NO_SIDE_EFFECTS__
function bipedal(fn, bindThis) {
  function result(...args) {
    const iterator = fn.call(this, function* (value) {
      if (isPromiseLike(value)) {
        const result2 = yield value;
        if ("resolved" in result2) {
          return result2.resolved;
        } else {
          throw result2.error;
        }
      }
      return value;
    }, ...args);
    return advance(iterator, void 0);
  }
  if (bindThis) {
    return result.bind(bindThis);
  } else {
    return result;
  }
}

// node_modules/@yume-chan/struct/esm/field/serialize.js
function defaultFieldSerializer(serializer) {
  return (source, context) => {
    if ("buffer" in context) {
      const buffer2 = serializer(source, context);
      context.buffer.set(buffer2, context.index);
      return buffer2.length;
    } else {
      return serializer(source, context);
    }
  };
}
function byobFieldSerializer(size, serializer) {
  return (source, context) => {
    if ("buffer" in context) {
      context.index ??= 0;
      serializer(source, context);
      return size;
    } else {
      const buffer2 = new Uint8Array(size);
      serializer(source, {
        buffer: buffer2,
        index: 0,
        littleEndian: context.littleEndian
      });
      return buffer2;
    }
  };
}

// node_modules/@yume-chan/struct/esm/field/factory.js
// @__NO_SIDE_EFFECTS__
function _field(size, type, serialize3, deserialize, options) {
  const field2 = {
    size,
    type,
    serialize: type === "default" ? defaultFieldSerializer(serialize3) : byobFieldSerializer(size, serialize3),
    deserialize: bipedal(deserialize),
    omitInit: options?.omitInit
  };
  if (options?.init) {
    field2.init = options.init;
  }
  return field2;
}
var field = _field;

// node_modules/@yume-chan/struct/esm/buffer.js
var EmptyUint8Array = new Uint8Array(0);
function copyMaybeDifferentLength(dest, source, index, length) {
  if (source.length < length) {
    dest.set(source, index);
    dest.fill(0, index + source.length, index + length);
  } else if (source.length === length) {
    dest.set(source, index);
  } else {
    dest.set(source.subarray(0, length), index);
  }
}
// @__NO_SIDE_EFFECTS__
function buffer(lengthOrField, converter) {
  if (typeof lengthOrField === "number") {
    let serialize3;
    let deserialize2;
    let init2;
    if (lengthOrField === 0) {
      serialize3 = () => {
      };
      if (converter) {
        deserialize2 = function* () {
          return converter.convert(EmptyUint8Array);
        };
      } else {
        deserialize2 = function* () {
          return EmptyUint8Array;
        };
      }
    } else {
      serialize3 = (value, { buffer: buffer2, index }) => copyMaybeDifferentLength(buffer2, value, index, lengthOrField);
      if (converter) {
        deserialize2 = function* (then, reader) {
          const array = reader.readExactly(lengthOrField);
          return converter.convert(yield* then(array));
        };
        init2 = (value) => converter.back(value);
      } else {
        deserialize2 = function* (_then, reader) {
          const array = reader.readExactly(lengthOrField);
          return array;
        };
      }
    }
    return field(lengthOrField, "byob", serialize3, deserialize2, { init: init2 });
  }
  if ((typeof lengthOrField === "object" || typeof lengthOrField === "function") && "serialize" in lengthOrField) {
    let deserialize2;
    let init2;
    if (converter) {
      deserialize2 = function* (then, reader, context) {
        const length = yield* then(lengthOrField.deserialize(reader, context));
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return converter.convert(yield* then(array));
      };
      init2 = (value) => converter.back(value);
    } else {
      deserialize2 = function* (then, reader, context) {
        const length = yield* then(lengthOrField.deserialize(reader, context));
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return array;
      };
    }
    return field(lengthOrField.size, "default", (value, { littleEndian }) => {
      if (lengthOrField.type === "default") {
        const lengthBuffer = lengthOrField.serialize(value.length, {
          littleEndian
        });
        if (value.length === 0) {
          return lengthBuffer;
        }
        const result = new Uint8Array(lengthBuffer.length + value.length);
        result.set(lengthBuffer, 0);
        result.set(value, lengthBuffer.length);
        return result;
      } else {
        const result = new Uint8Array(lengthOrField.size + value.length);
        lengthOrField.serialize(value.length, {
          buffer: result,
          index: 0,
          littleEndian
        });
        result.set(value, lengthOrField.size);
        return result;
      }
    }, deserialize2, { init: init2 });
  }
  if (typeof lengthOrField === "string") {
    let deserialize2;
    let init2;
    if (converter) {
      deserialize2 = function* (then, reader, { dependencies }) {
        const length = dependencies[lengthOrField];
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return converter.convert(yield* then(array));
      };
      init2 = (value, dependencies) => {
        const array = converter.back(value);
        dependencies[lengthOrField] = array.length;
        return array;
      };
    } else {
      deserialize2 = function* (_then, reader, { dependencies }) {
        const length = dependencies[lengthOrField];
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return array;
      };
      init2 = (value, dependencies) => {
        const array = value;
        dependencies[lengthOrField] = array.length;
        return array;
      };
    }
    return field(0, "default", (source) => source, deserialize2, { init: init2 });
  }
  let deserialize;
  let init;
  if (converter) {
    deserialize = function* (then, reader, { dependencies }) {
      const rawLength = dependencies[lengthOrField.field];
      const length = lengthOrField.convert(rawLength);
      const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
      return converter.convert(yield* then(array));
    };
    init = (value, dependencies) => {
      const array = converter.back(value);
      dependencies[lengthOrField.field] = lengthOrField.back(array.length);
      return array;
    };
  } else {
    deserialize = function* (_then, reader, { dependencies }) {
      const rawLength = dependencies[lengthOrField.field];
      const length = lengthOrField.convert(rawLength);
      const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
      return array;
    };
    init = (value, dependencies) => {
      const array = value;
      dependencies[lengthOrField.field] = lengthOrField.back(array.length);
      return array;
    };
  }
  return field(0, "default", (source) => source, deserialize, { init });
}

// node_modules/@yume-chan/struct/esm/readable.js
var ExactReadableEndedError = class extends Error {
  constructor() {
    super("ExactReadable ended");
  }
};
var Uint8ArrayExactReadable = class {
  #data;
  #position;
  get position() {
    return this.#position;
  }
  constructor(data) {
    this.#data = data;
    this.#position = 0;
  }
  readExactly(length) {
    if (this.#position + length > this.#data.length) {
      throw new ExactReadableEndedError();
    }
    const result = this.#data.subarray(this.#position, this.#position + length);
    this.#position += length;
    return result;
  }
};

// node_modules/@yume-chan/struct/esm/struct.js
var StructDeserializeError = class extends Error {
  constructor(message) {
    super(message);
  }
};
var StructNotEnoughDataError = class extends StructDeserializeError {
  constructor() {
    super("The underlying readable was ended before the struct was fully deserialized");
  }
};
var StructEmptyError = class extends StructDeserializeError {
  constructor() {
    super("The underlying readable doesn't contain any more struct");
  }
};
// @__NO_SIDE_EFFECTS__
function struct(fields, options) {
  const fieldList = Object.entries(fields);
  let size = 0;
  let byob = true;
  for (const [, field2] of fieldList) {
    size += field2.size;
    if (byob && field2.type !== "byob") {
      byob = false;
    }
  }
  const littleEndian = options.littleEndian;
  const extra = options.extra ? Object.getOwnPropertyDescriptors(options.extra) : void 0;
  return {
    littleEndian,
    fields,
    extra: options.extra,
    type: byob ? "byob" : "default",
    size,
    serialize(source, bufferOrContext) {
      const temp = { ...source };
      for (const [key, field2] of fieldList) {
        if (key in temp && "init" in field2) {
          const result = field2.init?.(temp[key], temp);
          temp[key] = result;
        }
      }
      const sizes = new Array(fieldList.length);
      const buffers = new Array(fieldList.length);
      {
        const context2 = { littleEndian };
        for (const [index2, [key, field2]] of fieldList.entries()) {
          if (field2.type === "byob") {
            sizes[index2] = field2.size;
          } else {
            buffers[index2] = field2.serialize(temp[key], context2);
            sizes[index2] = buffers[index2].length;
          }
        }
      }
      const size2 = sizes.reduce((sum, size3) => sum + size3, 0);
      let externalBuffer;
      let buffer2;
      let index;
      if (bufferOrContext instanceof Uint8Array) {
        if (bufferOrContext.length < size2) {
          throw new Error("Buffer too small");
        }
        externalBuffer = true;
        buffer2 = bufferOrContext;
        index = 0;
      } else if (typeof bufferOrContext === "object" && "buffer" in bufferOrContext) {
        externalBuffer = true;
        buffer2 = bufferOrContext.buffer;
        index = bufferOrContext.index ?? 0;
        if (buffer2.length - index < size2) {
          throw new Error("Buffer too small");
        }
      } else {
        externalBuffer = false;
        buffer2 = new Uint8Array(size2);
        index = 0;
      }
      const context = {
        buffer: buffer2,
        index,
        littleEndian
      };
      for (const [index2, [key, field2]] of fieldList.entries()) {
        if (buffers[index2]) {
          buffer2.set(buffers[index2], context.index);
        } else {
          field2.serialize(temp[key], context);
        }
        context.index += sizes[index2];
      }
      if (externalBuffer) {
        return size2;
      } else {
        return buffer2;
      }
    },
    deserialize: bipedal(function* (then, reader) {
      const startPosition = reader.position;
      const result = {};
      const context = {
        dependencies: result,
        littleEndian
      };
      try {
        for (const [key, field2] of fieldList) {
          result[key] = yield* then(field2.deserialize(reader, context));
        }
      } catch (e) {
        if (!(e instanceof ExactReadableEndedError)) {
          throw e;
        }
        if (reader.position === startPosition) {
          throw new StructEmptyError();
        } else {
          throw new StructNotEnoughDataError();
        }
      }
      if (extra) {
        Object.defineProperties(result, extra);
      }
      if (options.postDeserialize) {
        return options.postDeserialize.call(result, result);
      } else {
        return result;
      }
    })
  };
}

// node_modules/@yume-chan/struct/esm/concat.js
// @__NO_SIDE_EFFECTS__
function concat(options, ...structs) {
  return struct(structs.reduce((fields, struct2) => Object.assign(fields, struct2.fields), {}), {
    littleEndian: options.littleEndian,
    postDeserialize: options.postDeserialize,
    extra: structs.reduce((extras, struct2) => Object.defineProperties(extras, Object.getOwnPropertyDescriptors(struct2.extra)), {})
  });
}

// node_modules/@yume-chan/struct/esm/extend.js
// @__NO_SIDE_EFFECTS__
function extend(base, fields, options) {
  return struct(Object.assign({}, base.fields, fields), {
    littleEndian: options?.littleEndian ?? base.littleEndian,
    extra: base.extra,
    postDeserialize: options?.postDeserialize
  });
}

// node_modules/@yume-chan/no-data-view/esm/int16.js
// @__NO_SIDE_EFFECTS__
function getInt16(buffer2, offset, littleEndian) {
  return littleEndian ? (buffer2[offset] | buffer2[offset + 1] << 8) << 16 >> 16 : (buffer2[offset] << 8 | buffer2[offset + 1]) << 16 >> 16;
}
function setInt16(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
  } else {
    buffer2[offset] = value >> 8;
    buffer2[offset + 1] = value;
  }
}

// node_modules/@yume-chan/no-data-view/esm/int32.js
// @__NO_SIDE_EFFECTS__
function getInt32(buffer2, offset, littleEndian) {
  return littleEndian ? buffer2[offset] | buffer2[offset + 1] << 8 | buffer2[offset + 2] << 16 | buffer2[offset + 3] << 24 : buffer2[offset] << 24 | buffer2[offset + 1] << 16 | buffer2[offset + 2] << 8 | buffer2[offset + 3];
}
function setInt32(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
    buffer2[offset + 2] = value >> 16;
    buffer2[offset + 3] = value >> 24;
  } else {
    buffer2[offset] = value >> 24;
    buffer2[offset + 1] = value >> 16;
    buffer2[offset + 2] = value >> 8;
    buffer2[offset + 3] = value;
  }
}

// node_modules/@yume-chan/no-data-view/esm/int64.js
// @__NO_SIDE_EFFECTS__
function getInt64(buffer2, offset, littleEndian) {
  return littleEndian ? BigInt(buffer2[offset]) | BigInt(buffer2[offset + 1]) << 8n | BigInt(buffer2[offset + 2]) << 16n | BigInt(buffer2[offset + 3]) << 24n | BigInt(buffer2[offset + 4]) << 32n | BigInt(buffer2[offset + 5]) << 40n | BigInt(buffer2[offset + 6]) << 48n | BigInt(buffer2[offset + 7] << 24) << 32n : BigInt(buffer2[offset] << 24) << 32n | BigInt(buffer2[offset + 1]) << 48n | BigInt(buffer2[offset + 2]) << 40n | BigInt(buffer2[offset + 3]) << 32n | BigInt(buffer2[offset + 4]) << 24n | BigInt(buffer2[offset + 5]) << 16n | BigInt(buffer2[offset + 6]) << 8n | BigInt(buffer2[offset + 7]);
}
function setInt64LittleEndian(buffer2, offset, value) {
  buffer2[offset] = Number(value & 0xffn);
  buffer2[offset + 1] = Number(value >> 8n & 0xffn);
  buffer2[offset + 2] = Number(value >> 16n & 0xffn);
  buffer2[offset + 3] = Number(value >> 24n & 0xffn);
  buffer2[offset + 4] = Number(value >> 32n & 0xffn);
  buffer2[offset + 5] = Number(value >> 40n & 0xffn);
  buffer2[offset + 6] = Number(value >> 48n & 0xffn);
  buffer2[offset + 7] = Number(value >> 56n & 0xffn);
}
function setInt64BigEndian(buffer2, offset, value) {
  buffer2[offset] = Number(value >> 56n & 0xffn);
  buffer2[offset + 1] = Number(value >> 48n & 0xffn);
  buffer2[offset + 2] = Number(value >> 40n & 0xffn);
  buffer2[offset + 3] = Number(value >> 32n & 0xffn);
  buffer2[offset + 4] = Number(value >> 24n & 0xffn);
  buffer2[offset + 5] = Number(value >> 16n & 0xffn);
  buffer2[offset + 6] = Number(value >> 8n & 0xffn);
  buffer2[offset + 7] = Number(value & 0xffn);
}
function setInt64(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = Number(value & 0xffn);
    buffer2[offset + 1] = Number(value >> 8n & 0xffn);
    buffer2[offset + 2] = Number(value >> 16n & 0xffn);
    buffer2[offset + 3] = Number(value >> 24n & 0xffn);
    buffer2[offset + 4] = Number(value >> 32n & 0xffn);
    buffer2[offset + 5] = Number(value >> 40n & 0xffn);
    buffer2[offset + 6] = Number(value >> 48n & 0xffn);
    buffer2[offset + 7] = Number(value >> 56n & 0xffn);
  } else {
    buffer2[offset] = Number(value >> 56n & 0xffn);
    buffer2[offset + 1] = Number(value >> 48n & 0xffn);
    buffer2[offset + 2] = Number(value >> 40n & 0xffn);
    buffer2[offset + 3] = Number(value >> 32n & 0xffn);
    buffer2[offset + 4] = Number(value >> 24n & 0xffn);
    buffer2[offset + 5] = Number(value >> 16n & 0xffn);
    buffer2[offset + 6] = Number(value >> 8n & 0xffn);
    buffer2[offset + 7] = Number(value & 0xffn);
  }
}

// node_modules/@yume-chan/no-data-view/esm/int8.js
// @__NO_SIDE_EFFECTS__
function getInt8(buffer2, offset) {
  return buffer2[offset] << 24 >> 24;
}

// node_modules/@yume-chan/no-data-view/esm/uint16.js
// @__NO_SIDE_EFFECTS__
function getUint16BigEndian(buffer2, offset) {
  return buffer2[offset] << 8 | buffer2[offset + 1];
}
// @__NO_SIDE_EFFECTS__
function getUint16(buffer2, offset, littleEndian) {
  return littleEndian ? buffer2[offset] | buffer2[offset + 1] << 8 : buffer2[offset + 1] | buffer2[offset] << 8;
}
function setUint16(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
  } else {
    buffer2[offset] = value >> 8;
    buffer2[offset + 1] = value;
  }
}

// node_modules/@yume-chan/no-data-view/esm/uint32.js
// @__NO_SIDE_EFFECTS__
function getUint32LittleEndian(buffer2, offset) {
  return (buffer2[offset] | buffer2[offset + 1] << 8 | buffer2[offset + 2] << 16 | buffer2[offset + 3] << 24) >>> 0;
}
// @__NO_SIDE_EFFECTS__
function getUint32BigEndian(buffer2, offset) {
  return (buffer2[offset] << 24 | buffer2[offset + 1] << 16 | buffer2[offset + 2] << 8 | buffer2[offset + 3]) >>> 0;
}
// @__NO_SIDE_EFFECTS__
function getUint32(buffer2, offset, littleEndian) {
  return littleEndian ? (buffer2[offset] | buffer2[offset + 1] << 8 | buffer2[offset + 2] << 16 | buffer2[offset + 3] << 24) >>> 0 : (buffer2[offset] << 24 | buffer2[offset + 1] << 16 | buffer2[offset + 2] << 8 | buffer2[offset + 3]) >>> 0;
}
function setUint32LittleEndian(buffer2, offset, value) {
  buffer2[offset] = value;
  buffer2[offset + 1] = value >> 8;
  buffer2[offset + 2] = value >> 16;
  buffer2[offset + 3] = value >> 24;
}
function setUint32(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
    buffer2[offset + 2] = value >> 16;
    buffer2[offset + 3] = value >> 24;
  } else {
    buffer2[offset] = value >> 24;
    buffer2[offset + 1] = value >> 16;
    buffer2[offset + 2] = value >> 8;
    buffer2[offset + 3] = value;
  }
}

// node_modules/@yume-chan/no-data-view/esm/uint64.js
function getUint64LittleEndian(buffer2, offset) {
  return BigInt(buffer2[offset]) | BigInt(buffer2[offset + 1]) << 8n | BigInt(buffer2[offset + 2]) << 16n | BigInt(buffer2[offset + 3]) << 24n | BigInt(buffer2[offset + 4]) << 32n | BigInt(buffer2[offset + 5]) << 40n | BigInt(buffer2[offset + 6]) << 48n | BigInt(buffer2[offset + 7]) << 56n;
}
function getUint64BigEndian(buffer2, offset) {
  return BigInt(buffer2[offset]) << 56n | BigInt(buffer2[offset + 1]) << 48n | BigInt(buffer2[offset + 2]) << 40n | BigInt(buffer2[offset + 3]) << 32n | BigInt(buffer2[offset + 4]) << 24n | BigInt(buffer2[offset + 5]) << 16n | BigInt(buffer2[offset + 6]) << 8n | BigInt(buffer2[offset + 7]);
}
function getUint64(buffer2, offset, littleEndian) {
  return littleEndian ? BigInt(buffer2[offset]) | BigInt(buffer2[offset + 1]) << 8n | BigInt(buffer2[offset + 2]) << 16n | BigInt(buffer2[offset + 3]) << 24n | BigInt(buffer2[offset + 4]) << 32n | BigInt(buffer2[offset + 5]) << 40n | BigInt(buffer2[offset + 6]) << 48n | BigInt(buffer2[offset + 7]) << 56n : BigInt(buffer2[offset]) << 56n | BigInt(buffer2[offset + 1]) << 48n | BigInt(buffer2[offset + 2]) << 40n | BigInt(buffer2[offset + 3]) << 32n | BigInt(buffer2[offset + 4]) << 24n | BigInt(buffer2[offset + 5]) << 16n | BigInt(buffer2[offset + 6]) << 8n | BigInt(buffer2[offset + 7]);
}
function setUint64(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = Number(value & 0xffn);
    buffer2[offset + 1] = Number(value >> 8n & 0xffn);
    buffer2[offset + 2] = Number(value >> 16n & 0xffn);
    buffer2[offset + 3] = Number(value >> 24n & 0xffn);
    buffer2[offset + 4] = Number(value >> 32n & 0xffn);
    buffer2[offset + 5] = Number(value >> 40n & 0xffn);
    buffer2[offset + 6] = Number(value >> 48n & 0xffn);
    buffer2[offset + 7] = Number(value >> 56n & 0xffn);
  } else {
    buffer2[offset] = Number(value >> 56n & 0xffn);
    buffer2[offset + 1] = Number(value >> 48n & 0xffn);
    buffer2[offset + 2] = Number(value >> 40n & 0xffn);
    buffer2[offset + 3] = Number(value >> 32n & 0xffn);
    buffer2[offset + 4] = Number(value >> 24n & 0xffn);
    buffer2[offset + 5] = Number(value >> 16n & 0xffn);
    buffer2[offset + 6] = Number(value >> 8n & 0xffn);
    buffer2[offset + 7] = Number(value & 0xffn);
  }
}

// node_modules/@yume-chan/struct/esm/number.js
// @__NO_SIDE_EFFECTS__
function number(size, serialize3, deserialize) {
  const fn = (() => fn);
  Object.assign(fn, field(size, "byob", serialize3, deserialize));
  return fn;
}
var u8 = /* @__PURE__ */ number(1, (value, { buffer: buffer2, index }) => {
  buffer2[index] = value;
}, function* (then, reader) {
  const data = yield* then(reader.readExactly(1));
  return data[0];
});
var s8 = /* @__PURE__ */ number(1, (value, { buffer: buffer2, index }) => {
  buffer2[index] = value;
}, function* (then, reader) {
  const data = yield* then(reader.readExactly(1));
  return getInt8(data, 0);
});
var u16 = /* @__PURE__ */ number(2, (value, { buffer: buffer2, index, littleEndian }) => {
  setUint16(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(2));
  return getUint16(data, 0, littleEndian);
});
var s16 = /* @__PURE__ */ number(2, (value, { buffer: buffer2, index, littleEndian }) => {
  setInt16(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(2));
  return getInt16(data, 0, littleEndian);
});
var u32 = /* @__PURE__ */ number(4, (value, { buffer: buffer2, index, littleEndian }) => {
  setUint32(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(4));
  return getUint32(data, 0, littleEndian);
});
var s32 = /* @__PURE__ */ number(4, (value, { buffer: buffer2, index, littleEndian }) => {
  setInt32(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(4));
  return getInt32(data, 0, littleEndian);
});
var u64 = /* @__PURE__ */ number(8, (value, { buffer: buffer2, index, littleEndian }) => {
  setUint64(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(8));
  return getUint64(data, 0, littleEndian);
});
var s64 = /* @__PURE__ */ number(8, (value, { buffer: buffer2, index, littleEndian }) => {
  setInt64(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(8));
  return getInt64(data, 0, littleEndian);
});

// node_modules/@yume-chan/struct/esm/utils.js
var { TextEncoder, TextDecoder } = globalThis;
var SharedEncoder = /* @__PURE__ */ new TextEncoder();
var SharedDecoder = /* @__PURE__ */ new TextDecoder();
// @__NO_SIDE_EFFECTS__
function encodeUtf8(input) {
  return SharedEncoder.encode(input);
}
// @__NO_SIDE_EFFECTS__
function decodeUtf8(buffer2) {
  return SharedDecoder.decode(buffer2);
}

// node_modules/@yume-chan/struct/esm/string.js
var string = (/* @__NO_SIDE_EFFECTS__ */ (lengthOrField) => {
  const field2 = buffer(lengthOrField, {
    convert: decodeUtf8,
    back: encodeUtf8
  });
  field2.as = () => field2;
  return field2;
});

// node_modules/@yume-chan/stream-extra/esm/stream.js
var { AbortController } = globalThis;
var ReadableStream2 = /* @__PURE__ */ (() => {
  const { ReadableStream: ReadableStream3 } = globalThis;
  if (!ReadableStream3.from) {
    ReadableStream3.from = function(iterable) {
      const iterator = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
      return new ReadableStream3({
        async pull(controller) {
          const result = await iterator.next();
          if (result.done) {
            controller.close();
            return;
          }
          controller.enqueue(result.value);
        },
        async cancel(reason) {
          await iterator.return?.(reason);
        }
      });
    };
  }
  if (!ReadableStream3.prototype[Symbol.asyncIterator] || !ReadableStream3.prototype.values) {
    ReadableStream3.prototype.values = async function* (options) {
      const reader = this.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            return;
          }
          yield value;
        }
      } finally {
        if (!options?.preventCancel) {
          await reader.cancel();
        }
        reader.releaseLock();
      }
    };
    ReadableStream3.prototype[Symbol.asyncIterator] = // eslint-disable-next-line @typescript-eslint/unbound-method
    ReadableStream3.prototype.values;
  }
  return ReadableStream3;
})();
var { WritableStream, TransformStream } = globalThis;

// node_modules/@yume-chan/stream-extra/esm/task-queue.js
var TaskQueue = class {
  #ready;
  #disposed = false;
  enqueue(task, bail = false) {
    if (this.#disposed) {
      throw new Error("TaskQueue is disposed");
    }
    if (!this.#ready) {
      try {
        const result2 = task();
        if (isPromiseLike(result2)) {
          this.#ready = result2.then(() => {
          }, (e) => {
            if (bail) {
              throw e;
            }
          });
        }
        return result2;
      } catch (e) {
        if (bail) {
          const promise = Promise.reject(e);
          void promise.catch(() => {
          });
          this.#ready = promise;
        }
        throw e;
      }
    }
    const result = this.#ready.then(() => {
      if (this.#disposed) {
        throw new Error("TaskQueue is disposed");
      }
      return task();
    });
    this.#ready = result.then(() => {
    }, (e) => {
      if (bail || this.#disposed) {
        throw e;
      }
    });
    return result;
  }
  dispose() {
    this.#disposed = true;
  }
};

// node_modules/@yume-chan/stream-extra/esm/push-readable.js
var PushReadableStream = class extends ReadableStream2 {
  /**
   * Create a new `PushReadableStream` from a source.
   *
   * @param source If `source` returns a `Promise`, the stream will be closed
   * when the `Promise` is resolved, and be errored when the `Promise` is rejected.
   * @param strategy
   */
  constructor(source, strategy, logger) {
    let controller;
    const tasks = new TaskQueue();
    let zeroHighWaterMarkAllowEnqueue = false;
    let waterMarkLow;
    const abortController = new AbortController();
    let stopped = false;
    const enqueue = (chunk) => {
      logger?.({
        source: "producer",
        operation: "enqueue",
        value: chunk,
        phase: "start"
      });
      if (abortController.signal.aborted) {
        logger?.({
          source: "producer",
          operation: "enqueue",
          value: chunk,
          phase: "ignored"
        });
        return false;
      }
      if (controller.desiredSize === null) {
        controller.enqueue(chunk);
        throw new Error("unreachable");
      }
      if (zeroHighWaterMarkAllowEnqueue) {
        zeroHighWaterMarkAllowEnqueue = false;
        controller.enqueue(chunk);
        logger?.({
          source: "producer",
          operation: "enqueue",
          value: chunk,
          phase: "complete"
        });
        return true;
      }
      if (controller.desiredSize <= 0) {
        logger?.({
          source: "producer",
          operation: "enqueue",
          value: chunk,
          phase: "waiting"
        });
        waterMarkLow = new PromiseResolver();
        return waterMarkLow.promise.then(() => {
          controller.enqueue(chunk);
          logger?.({
            source: "producer",
            operation: "enqueue",
            value: chunk,
            phase: "complete"
          });
          return true;
        }, () => {
          logger?.({
            source: "producer",
            operation: "enqueue",
            value: chunk,
            phase: "ignored"
          });
          return false;
        });
      }
      controller.enqueue(chunk);
      logger?.({
        source: "producer",
        operation: "enqueue",
        value: chunk,
        phase: "complete"
      });
      return true;
    };
    const close = (explicit) => {
      logger?.({
        source: "producer",
        operation: "close",
        explicit,
        phase: "start"
      });
      if (abortController.signal.aborted || stopped && !explicit) {
        logger?.({
          source: "producer",
          operation: "close",
          explicit,
          phase: "ignored"
        });
        return;
      }
      controller.close();
      stopped = true;
      waterMarkLow?.reject();
      logger?.({
        source: "producer",
        operation: "close",
        explicit,
        phase: "complete"
      });
    };
    const error = (error2, explicit) => {
      logger?.({
        source: "producer",
        operation: "error",
        explicit,
        phase: "start"
      });
      stopped = true;
      controller.error(error2);
      waterMarkLow?.reject();
      logger?.({
        source: "producer",
        operation: "error",
        explicit,
        phase: "complete"
      });
    };
    super({
      start: (controller_) => {
        controller = controller_;
        const result = source({
          abortSignal: abortController.signal,
          enqueue: async (chunk) => (
            // Run `enqueue`s in serial
            // Use `async/await` to always return a `Promise`
            await tasks.enqueue(() => enqueue(chunk))
          ),
          close() {
            close(true);
          },
          error(e) {
            error(e, true);
          }
        });
        if (!stopped && isPromiseLike(result)) {
          result.then(() => close(false), (e) => error(e, false));
        }
      },
      pull: () => {
        logger?.({
          source: "consumer",
          operation: "pull",
          phase: "start"
        });
        if (waterMarkLow) {
          waterMarkLow.resolve(void 0);
          waterMarkLow = void 0;
        } else if (strategy?.highWaterMark === 0) {
          zeroHighWaterMarkAllowEnqueue = true;
        }
        logger?.({
          source: "consumer",
          operation: "pull",
          phase: "complete"
        });
      },
      cancel: (reason) => {
        logger?.({
          source: "consumer",
          operation: "cancel",
          phase: "start"
        });
        stopped = true;
        abortController.abort(reason);
        waterMarkLow?.reject();
        logger?.({
          source: "consumer",
          operation: "cancel",
          phase: "complete"
        });
      }
    }, strategy);
  }
};

// node_modules/@yume-chan/stream-extra/esm/try-close.js
function tryClose(value) {
  try {
    const result = value.close();
    if (isPromiseLike(result)) {
      return result.then(() => true, () => false);
    }
    return true;
  } catch {
    return false;
  }
}
async function tryCancel(stream) {
  try {
    await stream.cancel();
    return true;
  } catch {
    return false;
  }
}

// node_modules/@yume-chan/stream-extra/esm/buffered.js
var BufferedReadableStream = class {
  #buffered;
  // PERF: `subarray` is slow
  // don't use it until absolutely necessary
  #bufferedOffset = 0;
  #bufferedLength = 0;
  #position = 0;
  get position() {
    return this.#position;
  }
  stream;
  reader;
  constructor(stream) {
    this.stream = stream;
    this.reader = stream.getReader();
  }
  #readBuffered(length) {
    if (!this.#buffered) {
      return void 0;
    }
    const value = this.#buffered.subarray(this.#bufferedOffset, this.#bufferedOffset + length);
    if (this.#bufferedLength > length) {
      this.#position += length;
      this.#bufferedOffset += length;
      this.#bufferedLength -= length;
      return value;
    }
    this.#position += this.#bufferedLength;
    this.#buffered = void 0;
    this.#bufferedOffset = 0;
    this.#bufferedLength = 0;
    return value;
  }
  async #readSource(length) {
    const { done, value } = await this.reader.read();
    if (done) {
      throw new ExactReadableEndedError();
    }
    if (value.length > length) {
      this.#buffered = value;
      this.#bufferedOffset = length;
      this.#bufferedLength = value.length - length;
      this.#position += length;
      return value.subarray(0, length);
    }
    this.#position += value.length;
    return value;
  }
  iterateExactly(length) {
    let state = this.#buffered ? 0 : 1;
    return {
      next: () => {
        switch (state) {
          case 0: {
            const value = this.#readBuffered(length);
            if (value.length === length) {
              state = 2;
            } else {
              length -= value.length;
              state = 1;
            }
            return { done: false, value };
          }
          case 1:
            state = 3;
            return {
              done: false,
              value: this.#readSource(length).then((value) => {
                if (value.length === length) {
                  state = 2;
                } else {
                  length -= value.length;
                  state = 1;
                }
                return value;
              })
            };
          case 2:
            return { done: true, value: void 0 };
          case 3:
            throw new Error("Can't call `next` before previous Promise resolves");
          default:
            throw new Error("unreachable");
        }
      }
    };
  }
  readExactly = bipedal(function* (then, length) {
    let result;
    let index = 0;
    const initial = this.#readBuffered(length);
    if (initial) {
      if (initial.length === length) {
        return initial;
      }
      result = new Uint8Array(length);
      result.set(initial, index);
      index += initial.length;
      length -= initial.length;
    } else {
      result = new Uint8Array(length);
    }
    while (length > 0) {
      const value = yield* then(this.#readSource(length));
      result.set(value, index);
      index += value.length;
      length -= value.length;
    }
    return result;
  });
  /**
   * Return a readable stream with unconsumed data (if any) and
   * all data from the wrapped stream.
   * @returns A `ReadableStream`
   */
  release() {
    if (this.#bufferedLength > 0) {
      return new PushReadableStream(async (controller) => {
        const buffered = this.#buffered.subarray(this.#bufferedOffset);
        await controller.enqueue(buffered);
        controller.abortSignal.addEventListener("abort", () => {
          void tryCancel(this.reader);
        });
        while (true) {
          const { done, value } = await this.reader.read();
          if (done) {
            return;
          }
          await controller.enqueue(value);
        }
      });
    } else {
      this.reader.releaseLock();
      return this.stream;
    }
  }
  async cancel(reason) {
    await this.reader.cancel(reason);
  }
};

// node_modules/@yume-chan/stream-extra/esm/buffered-transform.js
var BufferedTransformStream = class {
  #readable;
  get readable() {
    return this.#readable;
  }
  #writable;
  get writable() {
    return this.#writable;
  }
  constructor(transform) {
    let bufferedStreamController;
    let writableStreamController;
    const buffered = new BufferedReadableStream(new PushReadableStream((controller) => {
      bufferedStreamController = controller;
    }));
    this.#readable = new ReadableStream2({
      async pull(controller) {
        try {
          const value = await transform(buffered);
          controller.enqueue(value);
        } catch (e) {
          if (e instanceof StructEmptyError) {
            controller.close();
            return;
          }
          throw e;
        }
      },
      cancel: (reason) => {
        return writableStreamController.error(reason);
      }
    });
    this.#writable = new WritableStream({
      start(controller) {
        writableStreamController = controller;
      },
      async write(chunk) {
        await bufferedStreamController.enqueue(chunk);
      },
      abort() {
        bufferedStreamController.close();
      },
      close() {
        bufferedStreamController.close();
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/concat.js
var ConcatStringStream = class {
  // PERF: rope (concat strings) is faster than `[].join('')`
  #result = "";
  #resolver = new PromiseResolver();
  #writable = new WritableStream({
    write: (chunk) => {
      this.#result += chunk;
    },
    close: () => {
      this.#resolver.resolve(this.#result);
      this.#readableController.enqueue(this.#result);
      this.#readableController.close();
    },
    abort: (reason) => {
      this.#resolver.reject(reason);
      this.#readableController.error(reason);
    }
  });
  get writable() {
    return this.#writable;
  }
  #readableController;
  #readable = new ReadableStream2({
    start: (controller) => {
      this.#readableController = controller;
    }
  });
  get readable() {
    return this.#readable;
  }
  constructor() {
    void Object.defineProperties(this.#readable, {
      then: {
        get: () => this.#resolver.promise.then.bind(this.#resolver.promise)
      },
      catch: {
        get: () => this.#resolver.promise.catch.bind(this.#resolver.promise)
      },
      finally: {
        get: () => this.#resolver.promise.finally.bind(this.#resolver.promise)
      }
    });
  }
};
var ConcatBufferStream = class {
  #segments = [];
  #resolver = new PromiseResolver();
  #writable = new WritableStream({
    write: (chunk) => {
      this.#segments.push(chunk);
    },
    close: () => {
      let result;
      let offset = 0;
      switch (this.#segments.length) {
        case 0:
          result = EmptyUint8Array;
          break;
        case 1:
          result = this.#segments[0];
          break;
        default:
          result = new Uint8Array(this.#segments.reduce((prev, item) => prev + item.length, 0));
          for (const segment of this.#segments) {
            result.set(segment, offset);
            offset += segment.length;
          }
          break;
      }
      this.#resolver.resolve(result);
      this.#readableController.enqueue(result);
      this.#readableController.close();
    },
    abort: (reason) => {
      this.#resolver.reject(reason);
      this.#readableController.error(reason);
    }
  });
  get writable() {
    return this.#writable;
  }
  #readableController;
  #readable = new ReadableStream2({
    start: (controller) => {
      this.#readableController = controller;
    }
  });
  get readable() {
    return this.#readable;
  }
  constructor() {
    void Object.defineProperties(this.#readable, {
      then: {
        get: () => this.#resolver.promise.then.bind(this.#resolver.promise)
      },
      catch: {
        get: () => this.#resolver.promise.catch.bind(this.#resolver.promise)
      },
      finally: {
        get: () => this.#resolver.promise.finally.bind(this.#resolver.promise)
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/consumable/readable.js
var ConsumableReadableStream = class _ConsumableReadableStream extends ReadableStream2 {
  static async enqueue(controller, chunk) {
    const output = new Consumable(chunk);
    controller.enqueue(output);
    await output.consumed;
  }
  constructor(source, strategy) {
    let wrappedController;
    let wrappedStrategy;
    if (strategy) {
      wrappedStrategy = {};
      if ("highWaterMark" in strategy) {
        wrappedStrategy.highWaterMark = strategy.highWaterMark;
      }
      if ("size" in strategy) {
        wrappedStrategy.size = (chunk) => {
          return strategy.size(chunk.value);
        };
      }
    }
    super({
      start(controller) {
        wrappedController = {
          enqueue(chunk) {
            return _ConsumableReadableStream.enqueue(controller, chunk);
          },
          close() {
            controller.close();
          },
          error(reason) {
            controller.error(reason);
          }
        };
        return source.start?.(wrappedController);
      },
      pull() {
        return source.pull?.(wrappedController);
      },
      cancel(reason) {
        return source.cancel?.(reason);
      }
    }, wrappedStrategy);
  }
};

// node_modules/@yume-chan/stream-extra/esm/consumable/wrap-byte-readable.js
var ConsumableWrapByteReadableStream = class extends ReadableStream2 {
  constructor(stream, chunkSize, min) {
    const reader = stream.getReader({ mode: "byob" });
    let array = new Uint8Array(chunkSize);
    super({
      async pull(controller) {
        const { done, value } = await reader.read(array, { min });
        if (done) {
          controller.close();
          return;
        }
        await ConsumableReadableStream.enqueue(controller, value);
        array = new Uint8Array(value.buffer);
      },
      cancel(reason) {
        return reader.cancel(reason);
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/consumable/wrap-writable.js
var ConsumableWrapWritableStream = class extends WritableStream {
  constructor(stream) {
    const writer = stream.getWriter();
    super({
      write(chunk) {
        return chunk.tryConsume((chunk2) => writer.write(chunk2));
      },
      abort(reason) {
        return writer.abort(reason);
      },
      close() {
        return writer.close();
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/consumable/writable.js
var ConsumableWritableStream = class extends WritableStream {
  static async write(writer, value) {
    const consumable = new Consumable(value);
    await writer.write(consumable);
    await consumable.consumed;
  }
  constructor(sink, strategy) {
    let wrappedStrategy;
    if (strategy) {
      wrappedStrategy = {};
      if ("highWaterMark" in strategy) {
        wrappedStrategy.highWaterMark = strategy.highWaterMark;
      }
      if ("size" in strategy) {
        wrappedStrategy.size = (chunk) => {
          return strategy.size(chunk instanceof Consumable ? chunk.value : chunk);
        };
      }
    }
    super({
      start(controller) {
        return sink.start?.(controller);
      },
      write(chunk, controller) {
        return chunk.tryConsume((chunk2) => sink.write?.(chunk2, controller));
      },
      abort(reason) {
        return sink.abort?.(reason);
      },
      close() {
        return sink.close?.();
      }
    }, wrappedStrategy);
  }
};

// node_modules/@yume-chan/stream-extra/esm/task.js
var { console } = globalThis;
var createTask = /* @__PURE__ */ (() => console?.createTask?.bind(console) ?? (() => ({
  run(callback) {
    return callback();
  }
})))();

// node_modules/@yume-chan/stream-extra/esm/consumable.js
var Consumable = class {
  static WritableStream = ConsumableWritableStream;
  static WrapWritableStream = ConsumableWrapWritableStream;
  static ReadableStream = ConsumableReadableStream;
  static WrapByteReadableStream = ConsumableWrapByteReadableStream;
  #task;
  #resolver;
  value;
  consumed;
  constructor(value) {
    this.#task = createTask("Consumable");
    this.value = value;
    this.#resolver = new PromiseResolver();
    this.consumed = this.#resolver.promise;
  }
  consume() {
    this.#resolver.resolve();
  }
  error(error) {
    this.#resolver.reject(error);
  }
  tryConsume(callback) {
    try {
      let result = this.#task.run(() => callback(this.value));
      if (isPromiseLike(result)) {
        result = result.then((value) => {
          this.#resolver.resolve();
          return value;
        }, (e) => {
          this.#resolver.reject(e);
          throw e;
        });
      } else {
        this.#resolver.resolve();
      }
      return result;
    } catch (e) {
      this.#resolver.reject(e);
      throw e;
    }
  }
};

// node_modules/@yume-chan/stream-extra/esm/maybe-consumable/index.js
var maybe_consumable_exports = {};
__export(maybe_consumable_exports, {
  WrapWritableStream: () => MaybeConsumableWrapWritableStream,
  WritableStream: () => MaybeConsumableWritableStream,
  getValue: () => getValue,
  tryConsume: () => tryConsume
});

// node_modules/@yume-chan/stream-extra/esm/maybe-consumable/utils.js
function getValue(value) {
  return value instanceof Consumable ? value.value : value;
}
function tryConsume(value, callback) {
  if (value instanceof Consumable) {
    return value.tryConsume(callback);
  } else {
    return callback(value);
  }
}

// node_modules/@yume-chan/stream-extra/esm/maybe-consumable/wrap-writable.js
var MaybeConsumableWrapWritableStream = class extends WritableStream {
  constructor(stream) {
    const writer = stream.getWriter();
    super({
      write(chunk) {
        return tryConsume(chunk, (chunk2) => writer.write(chunk2));
      },
      abort(reason) {
        return writer.abort(reason);
      },
      close() {
        return writer.close();
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/maybe-consumable/writable.js
var MaybeConsumableWritableStream = class extends WritableStream {
  constructor(sink, strategy) {
    let wrappedStrategy;
    if (strategy) {
      wrappedStrategy = {};
      if ("highWaterMark" in strategy) {
        wrappedStrategy.highWaterMark = strategy.highWaterMark;
      }
      if ("size" in strategy) {
        wrappedStrategy.size = (chunk) => {
          return strategy.size(chunk instanceof Consumable ? chunk.value : chunk);
        };
      }
    }
    super({
      start(controller) {
        return sink.start?.(controller);
      },
      write(chunk, controller) {
        return tryConsume(chunk, (chunk2) => sink.write?.(chunk2, controller));
      },
      abort(reason) {
        return sink.abort?.(reason);
      },
      close() {
        return sink.close?.();
      }
    }, wrappedStrategy);
  }
};

// node_modules/@yume-chan/stream-extra/esm/distribution.js
var BufferCombiner = class {
  #capacity;
  #buffer;
  #offset;
  #available;
  constructor(size) {
    this.#capacity = size;
    this.#buffer = new Uint8Array(size);
    this.#offset = 0;
    this.#available = size;
  }
  /**
   * Pushes data to the combiner.
   * @param data The input data to be split or combined.
   * @returns
   * A generator that yields buffers of specified size.
   * It may yield the same buffer multiple times, consume the data before calling `next`.
   */
  *push(data) {
    let offset = 0;
    let available = data.length;
    if (this.#offset !== 0) {
      if (available >= this.#available) {
        this.#buffer.set(data.subarray(0, this.#available), this.#offset);
        offset += this.#available;
        available -= this.#available;
        yield this.#buffer;
        this.#offset = 0;
        this.#available = this.#capacity;
        if (available === 0) {
          return;
        }
      } else {
        this.#buffer.set(data, this.#offset);
        this.#offset += available;
        this.#available -= available;
        return;
      }
    }
    while (available >= this.#capacity) {
      const end = offset + this.#capacity;
      yield data.subarray(offset, end);
      offset = end;
      available -= this.#capacity;
    }
    if (available > 0) {
      this.#buffer.set(data.subarray(offset), this.#offset);
      this.#offset += available;
      this.#available -= available;
    }
  }
  flush() {
    if (this.#offset === 0) {
      return void 0;
    }
    const output = this.#buffer.subarray(0, this.#offset);
    this.#offset = 0;
    this.#available = this.#capacity;
    return output;
  }
};
var DistributionStream = class extends TransformStream {
  constructor(size, combine = false) {
    const combiner = combine ? new BufferCombiner(size) : void 0;
    super({
      async transform(chunk, controller) {
        await maybe_consumable_exports.tryConsume(chunk, async (chunk2) => {
          if (combiner) {
            for (const buffer2 of combiner.push(chunk2)) {
              await Consumable.ReadableStream.enqueue(controller, buffer2);
            }
          } else {
            let offset = 0;
            let available = chunk2.length;
            while (available > 0) {
              const end = offset + size;
              await Consumable.ReadableStream.enqueue(controller, chunk2.subarray(offset, end));
              offset = end;
              available -= size;
            }
          }
        });
      },
      flush(controller) {
        if (combiner) {
          const data = combiner.flush();
          if (data) {
            controller.enqueue(data);
          }
        }
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/wrap-readable.js
function getWrappedReadableStream(wrapper, controller) {
  if ("start" in wrapper) {
    return wrapper.start(controller);
  } else if (typeof wrapper === "function") {
    return wrapper(controller);
  } else {
    return wrapper;
  }
}
var WrapReadableStream = class extends ReadableStream2 {
  readable;
  #reader;
  constructor(wrapper, strategy) {
    super({
      start: async (controller) => {
        const readable = await getWrappedReadableStream(wrapper, controller);
        this.readable = readable;
        this.#reader = this.readable.getReader();
      },
      pull: async (controller) => {
        const { done, value } = await this.#reader.read().catch((e) => {
          if ("error" in wrapper) {
            wrapper.error(e);
          }
          throw e;
        });
        if (done) {
          controller.close();
          if ("close" in wrapper) {
            await wrapper.close?.();
          }
        } else {
          controller.enqueue(value);
        }
      },
      cancel: async (reason) => {
        await this.#reader.cancel(reason);
        if ("cancel" in wrapper) {
          await wrapper.cancel?.(reason);
        }
      }
    }, strategy);
  }
};

// node_modules/@yume-chan/stream-extra/esm/duplex.js
var NOOP = () => {
};
var DuplexStreamFactory = class {
  #readableControllers = [];
  #writers = [];
  #writableClosed = false;
  get writableClosed() {
    return this.#writableClosed;
  }
  #closed = new PromiseResolver();
  get closed() {
    return this.#closed.promise;
  }
  #options;
  constructor(options) {
    this.#options = options ?? {};
  }
  wrapReadable(readable, strategy) {
    return new WrapReadableStream({
      start: (controller) => {
        this.#readableControllers.push(controller);
        return readable;
      },
      cancel: async () => {
        await this.close();
      },
      close: async () => {
        await this.dispose();
      }
    }, strategy);
  }
  createWritable(stream) {
    const writer = stream.getWriter();
    this.#writers.push(writer);
    return new WritableStream({
      write: async (chunk) => {
        await writer.write(chunk);
      },
      abort: async (reason) => {
        await writer.abort(reason);
        await this.close();
      },
      close: async () => {
        await writer.close().catch(NOOP);
        await this.close();
      }
    });
  }
  async close() {
    if (this.#writableClosed) {
      return;
    }
    this.#writableClosed = true;
    if (await this.#options.close?.() !== false) {
      await this.dispose();
    }
    for (const writer of this.#writers) {
      writer.close().catch(NOOP);
    }
  }
  async dispose() {
    this.#writableClosed = true;
    this.#closed.resolve();
    for (const controller of this.#readableControllers) {
      tryClose(controller);
    }
    await this.#options.dispose?.();
  }
};

// node_modules/@yume-chan/stream-extra/esm/encoding.js
var Global = globalThis;
var TextDecoderStream = Global.TextDecoderStream;
var TextEncoderStream = Global.TextEncoderStream;

// node_modules/@yume-chan/stream-extra/esm/inspect.js
var InspectStream = class extends TransformStream {
  constructor(callback) {
    super({
      transform(chunk, controller) {
        callback(chunk);
        controller.enqueue(chunk);
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/pipe-from.js
function pipeFrom(writable, pair) {
  const writer = pair.writable.getWriter();
  const pipe = pair.readable.pipeTo(writable);
  return new WritableStream({
    async write(chunk) {
      await writer.write(chunk);
    },
    async close() {
      await writer.close();
      await pipe;
    }
  });
}

// node_modules/@yume-chan/stream-extra/esm/split-string.js
var SplitStringStream = class extends TransformStream {
  constructor(separator) {
    let remaining = void 0;
    super({
      transform(chunk, controller) {
        if (remaining) {
          chunk = remaining + chunk;
          remaining = void 0;
        }
        let start = 0;
        while (start < chunk.length) {
          const index = chunk.indexOf(separator, start);
          if (index === -1) {
            remaining = chunk.substring(start);
            break;
          }
          controller.enqueue(chunk.substring(start, index));
          start = index + 1;
        }
      },
      flush(controller) {
        if (remaining) {
          controller.enqueue(remaining);
        }
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/struct-deserialize.js
var StructDeserializeStream = class extends BufferedTransformStream {
  constructor(struct2) {
    super((stream) => {
      return struct2.deserialize(stream);
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/struct-serialize.js
var StructSerializeStream = class extends TransformStream {
  constructor(struct2) {
    super({
      transform(chunk, controller) {
        controller.enqueue(struct2.serialize(chunk));
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/wrap-writable.js
async function getWrappedWritableStream(start) {
  if ("start" in start) {
    return await start.start();
  } else if (typeof start === "function") {
    return await start();
  } else {
    return start;
  }
}
var WrapWritableStream = class _WrapWritableStream extends WritableStream {
  writable;
  #writer;
  constructor(start) {
    super({
      start: async () => {
        const writable = await getWrappedWritableStream(start);
        this.writable = writable;
        this.#writer = this.writable.getWriter();
      },
      write: async (chunk) => {
        await this.#writer.write(chunk);
      },
      abort: async (reason) => {
        await this.#writer.abort(reason);
        if (start !== this.writable && "close" in start) {
          await start.close?.();
        }
      },
      close: async () => {
        await this.#writer.close();
        if (start !== this.writable && "close" in start) {
          await start.close?.();
        }
      }
    });
  }
  bePipedThroughFrom(transformer) {
    let promise;
    return new _WrapWritableStream({
      start: () => {
        promise = transformer.readable.pipeTo(this);
        return transformer.writable;
      },
      async close() {
        await promise;
      }
    });
  }
};

// node_modules/@yume-chan/event/esm/index.js
var esm_exports3 = {};
__export(esm_exports3, {
  AutoDisposable: () => AutoDisposable,
  DisposableList: () => DisposableList,
  EventEmitter: () => EventEmitter,
  StickyEventEmitter: () => StickyEventEmitter,
  once: () => once
});

// node_modules/@yume-chan/event/esm/disposable.js
var AutoDisposable = class {
  #disposables = [];
  constructor() {
    this.dispose = this.dispose.bind(this);
  }
  addDisposable(disposable) {
    this.#disposables.push(disposable);
    return disposable;
  }
  dispose() {
    for (const disposable of this.#disposables) {
      disposable.dispose();
    }
    this.#disposables = [];
  }
};
var DisposableList = class extends AutoDisposable {
  add(disposable) {
    return this.addDisposable(disposable);
  }
};

// node_modules/@yume-chan/event/esm/event-emitter.js
var EventEmitter = class {
  listeners = [];
  constructor() {
    this.event = this.event.bind(this);
  }
  addEventListener(info) {
    this.listeners.push(info);
    const remove = () => {
      const index = this.listeners.indexOf(info);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
    remove.dispose = remove;
    return remove;
  }
  event = (listener, thisArg, ...args) => {
    const info = {
      listener,
      thisArg,
      args
    };
    return this.addEventListener(info);
  };
  fire(e) {
    for (const info of this.listeners.slice()) {
      info.listener.call(info.thisArg, e, ...info.args);
    }
  }
  dispose() {
    this.listeners.length = 0;
  }
};

// node_modules/@yume-chan/event/esm/sticky-event-emitter.js
var Undefined = /* @__PURE__ */ Symbol("undefined");
var StickyEventEmitter = class extends EventEmitter {
  #value = Undefined;
  addEventListener(info) {
    if (this.#value !== Undefined) {
      info.listener.call(info.thisArg, this.#value, ...info.args);
    }
    return super.addEventListener(info);
  }
  fire(e) {
    this.#value = e;
    super.fire(e);
  }
};

// node_modules/@yume-chan/event/esm/utils.js
async function once(event) {
  const resolver = new PromiseResolver();
  const dispose = event(resolver.resolve);
  const result = await resolver.promise;
  dispose();
  return result;
}

// node_modules/@yume-chan/adb/esm/commands/base.js
var AdbServiceBase = class extends AutoDisposable {
  #adb;
  get adb() {
    return this.#adb;
  }
  constructor(adb) {
    super();
    this.#adb = adb;
  }
};

// node_modules/@yume-chan/adb/esm/commands/framebuffer.js
var Version = struct({ version: u32 }, { littleEndian: true });
var AdbFrameBufferV1 = struct({
  bpp: u32,
  size: u32,
  width: u32,
  height: u32,
  red_offset: u32,
  red_length: u32,
  blue_offset: u32,
  blue_length: u32,
  green_offset: u32,
  green_length: u32,
  alpha_offset: u32,
  alpha_length: u32,
  data: buffer("size")
}, { littleEndian: true });
var AdbFrameBufferV2 = struct({
  bpp: u32,
  colorSpace: u32,
  size: u32,
  width: u32,
  height: u32,
  red_offset: u32,
  red_length: u32,
  blue_offset: u32,
  blue_length: u32,
  green_offset: u32,
  green_length: u32,
  alpha_offset: u32,
  alpha_length: u32,
  data: buffer("size")
}, { littleEndian: true });
var AdbFrameBufferError = class extends Error {
  constructor(message, options) {
    super(message, options);
  }
};
var AdbFrameBufferUnsupportedVersionError = class extends AdbFrameBufferError {
  constructor(version) {
    super(`Unsupported FrameBuffer version ${version}`);
  }
};
var AdbFrameBufferForbiddenError = class extends AdbFrameBufferError {
  constructor() {
    super("FrameBuffer is disabled by current app");
  }
};
async function framebuffer(adb) {
  const socket = await adb.createSocket("framebuffer:");
  const stream = new BufferedReadableStream(socket.readable);
  let version;
  try {
    ({ version } = await Version.deserialize(stream));
  } catch (e) {
    if (e instanceof StructEmptyError) {
      throw new AdbFrameBufferForbiddenError();
    }
    throw e;
  }
  switch (version) {
    case 1:
      return await AdbFrameBufferV1.deserialize(stream);
    case 2:
      return await AdbFrameBufferV2.deserialize(stream);
    default:
      throw new AdbFrameBufferUnsupportedVersionError(version);
  }
}

// node_modules/@yume-chan/adb/esm/commands/power.js
var AdbPower = class extends AdbServiceBase {
  reboot(mode = "") {
    return this.adb.createSocketAndWait(`reboot:${mode}`);
  }
  bootloader() {
    return this.reboot("bootloader");
  }
  fastboot() {
    return this.reboot("fastboot");
  }
  recovery() {
    return this.reboot("recovery");
  }
  sideload() {
    return this.reboot("sideload");
  }
  /**
   * Reboot to Qualcomm Emergency Download (EDL) Mode.
   *
   * Only works on some Qualcomm devices.
   */
  qualcommEdlMode() {
    return this.reboot("edl");
  }
  powerOff() {
    return this.adb.subprocess.noneProtocol.spawnWaitText(["reboot", "-p"]);
  }
  powerButton(longPress = false) {
    const args = ["input", "keyevent"];
    if (longPress) {
      args.push("--longpress");
    }
    args.push("POWER");
    return this.adb.subprocess.noneProtocol.spawnWaitText(args);
  }
  /**
   * Reboot to Samsung Odin download mode.
   *
   * Only works on Samsung devices.
   */
  samsungOdin() {
    return this.reboot("download");
  }
};

// node_modules/@yume-chan/adb/esm/utils/array-buffer.js
function toLocalUint8Array(value) {
  if (value.buffer instanceof ArrayBuffer) {
    return value;
  }
  const copy = new Uint8Array(value.length);
  copy.set(value);
  return copy;
}

// node_modules/@yume-chan/adb/esm/utils/auto-reset-event.js
var AutoResetEvent = class {
  #set;
  #queue = [];
  constructor(initialSet = false) {
    this.#set = initialSet;
  }
  wait() {
    if (!this.#set) {
      this.#set = true;
      if (this.#queue.length === 0) {
        return Promise.resolve();
      }
    }
    const resolver = new PromiseResolver();
    this.#queue.push(resolver);
    return resolver.promise;
  }
  notifyOne() {
    if (this.#queue.length !== 0) {
      this.#queue.pop().resolve();
    } else {
      this.#set = false;
    }
  }
  dispose() {
    for (const item of this.#queue) {
      item.reject(new Error("The AutoResetEvent has been disposed"));
    }
    this.#queue.length = 0;
  }
};

// node_modules/@yume-chan/adb/esm/utils/base64.js
var [charToIndex, indexToChar, paddingChar] = /* @__PURE__ */ (() => {
  const charToIndex2 = [];
  const indexToChar2 = [];
  const paddingChar2 = "=".charCodeAt(0);
  function addRange(start, end) {
    const charCodeStart = start.charCodeAt(0);
    const charCodeEnd = end.charCodeAt(0);
    for (let charCode = charCodeStart; charCode <= charCodeEnd; charCode += 1) {
      charToIndex2[charCode] = indexToChar2.length;
      indexToChar2.push(charCode);
    }
  }
  addRange("A", "Z");
  addRange("a", "z");
  addRange("0", "9");
  addRange("+", "+");
  addRange("/", "/");
  return [charToIndex2, indexToChar2, paddingChar2];
})();
function calculateBase64EncodedLength(inputLength) {
  const remainder = inputLength % 3;
  const paddingLength = remainder !== 0 ? 3 - remainder : 0;
  return [(inputLength + paddingLength) / 3 * 4, paddingLength];
}
function encodeBase64(input, output) {
  const [outputLength, paddingLength] = calculateBase64EncodedLength(input.length);
  if (!output) {
    output = new Uint8Array(outputLength);
    encodeForward(input, output, paddingLength);
    return output;
  } else {
    if (output.length < outputLength) {
      throw new TypeError("output buffer is too small");
    }
    output = output.subarray(0, outputLength);
    if (input.buffer !== output.buffer) {
      encodeForward(input, output, paddingLength);
    } else if (output.byteOffset + output.length - (paddingLength + 1) <= input.byteOffset + input.length) {
      encodeForward(input, output, paddingLength);
    } else if (output.byteOffset >= input.byteOffset - 1) {
      encodeBackward(input, output, paddingLength);
    } else {
      throw new TypeError("input and output cannot overlap");
    }
    return outputLength;
  }
}
function encodeForward(input, output, paddingLength) {
  let inputIndex = 0;
  let outputIndex = 0;
  while (inputIndex < input.length - 2) {
    const x = input[inputIndex];
    inputIndex += 1;
    const y = input[inputIndex];
    inputIndex += 1;
    const z = input[inputIndex];
    inputIndex += 1;
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex += 1;
    output[outputIndex] = indexToChar[(x & 3) << 4 | y >> 4];
    outputIndex += 1;
    output[outputIndex] = indexToChar[(y & 15) << 2 | z >> 6];
    outputIndex += 1;
    output[outputIndex] = indexToChar[z & 63];
    outputIndex += 1;
  }
  if (paddingLength === 2) {
    const x = input[inputIndex];
    inputIndex += 1;
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex += 1;
    output[outputIndex] = indexToChar[(x & 3) << 4];
    outputIndex += 1;
    output[outputIndex] = paddingChar;
    outputIndex += 1;
    output[outputIndex] = paddingChar;
  } else if (paddingLength === 1) {
    const x = input[inputIndex];
    inputIndex += 1;
    const y = input[inputIndex];
    inputIndex += 1;
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex += 1;
    output[outputIndex] = indexToChar[(x & 3) << 4 | y >> 4];
    outputIndex += 1;
    output[outputIndex] = indexToChar[(y & 15) << 2];
    outputIndex += 1;
    output[outputIndex] = paddingChar;
  }
}
function encodeBackward(input, output, paddingLength) {
  let inputIndex = input.length - 1;
  let outputIndex = output.length - 1;
  if (paddingLength === 2) {
    const x = input[inputIndex];
    inputIndex -= 1;
    output[outputIndex] = paddingChar;
    outputIndex -= 1;
    output[outputIndex] = paddingChar;
    outputIndex -= 1;
    output[outputIndex] = indexToChar[(x & 3) << 4];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex -= 1;
  } else if (paddingLength === 1) {
    const y = input[inputIndex];
    inputIndex -= 1;
    const x = input[inputIndex];
    inputIndex -= 1;
    output[outputIndex] = paddingChar;
    outputIndex -= 1;
    output[outputIndex] = indexToChar[(y & 15) << 2];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[(x & 3) << 4 | y >> 4];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex -= 1;
  }
  while (inputIndex >= 0) {
    const z = input[inputIndex];
    inputIndex -= 1;
    const y = input[inputIndex];
    inputIndex -= 1;
    const x = input[inputIndex];
    inputIndex -= 1;
    output[outputIndex] = indexToChar[z & 63];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[(y & 15) << 2 | z >> 6];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[(x & 3) << 4 | y >> 4];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex -= 1;
  }
}
function decodeBase64(input) {
  let padding;
  if (input[input.length - 2] === "=") {
    padding = 2;
  } else if (input[input.length - 1] === "=") {
    padding = 1;
  } else {
    padding = 0;
  }
  const result = new Uint8Array(input.length / 4 * 3 - padding);
  let sIndex = 0;
  let dIndex = 0;
  while (sIndex < input.length - (padding !== 0 ? 4 : 0)) {
    const a = charToIndex[input.charCodeAt(sIndex)];
    sIndex += 1;
    const b = charToIndex[input.charCodeAt(sIndex)];
    sIndex += 1;
    const c = charToIndex[input.charCodeAt(sIndex)];
    sIndex += 1;
    const d = charToIndex[input.charCodeAt(sIndex)];
    sIndex += 1;
    result[dIndex] = a << 2 | (b & 48) >> 4;
    dIndex += 1;
    result[dIndex] = (b & 15) << 4 | (c & 60) >> 2;
    dIndex += 1;
    result[dIndex] = (c & 3) << 6 | d;
    dIndex += 1;
  }
  if (padding === 1) {
    const a = charToIndex[input.charCodeAt(sIndex)];
    sIndex += 1;
    const b = charToIndex[input.charCodeAt(sIndex)];
    sIndex += 1;
    const c = charToIndex[input.charCodeAt(sIndex)];
    result[dIndex] = a << 2 | (b & 48) >> 4;
    dIndex += 1;
    result[dIndex] = (b & 15) << 4 | (c & 60) >> 2;
  } else if (padding === 2) {
    const a = charToIndex[input.charCodeAt(sIndex)];
    sIndex += 1;
    const b = charToIndex[input.charCodeAt(sIndex)];
    result[dIndex] = a << 2 | (b & 48) >> 4;
  }
  return result;
}

// node_modules/@yume-chan/adb/esm/utils/hex.js
function hexCharToNumber(char) {
  if (char < 48) {
    throw new TypeError(`Invalid hex char ${char}`);
  }
  if (char < 58) {
    return char - 48;
  }
  if (char < 65) {
    throw new TypeError(`Invalid hex char ${char}`);
  }
  if (char < 71) {
    return char - 55;
  }
  if (char < 97) {
    throw new TypeError(`Invalid hex char ${char}`);
  }
  if (char < 103) {
    return char - 87;
  }
  throw new TypeError(`Invalid hex char ${char}`);
}
function hexToNumber(data) {
  let result = 0;
  for (let i = 0; i < data.length; i += 1) {
    result = result << 4 | hexCharToNumber(data[i]);
  }
  return result;
}
function write4HexDigits(buffer2, index, value) {
  const start = index;
  index += 3;
  while (index >= start && value > 0) {
    const digit = value & 15;
    value >>= 4;
    if (digit < 10) {
      buffer2[index] = digit + 48;
    } else {
      buffer2[index] = digit + 87;
    }
    index -= 1;
  }
  while (index >= start) {
    buffer2[index] = 48;
    index -= 1;
  }
}

// node_modules/@yume-chan/adb/esm/utils/no-op.js
var NOOP2 = /* @__NO_SIDE_EFFECTS__ */ () => {
};
function unreachable(...args) {
  throw new Error("Unreachable. Arguments:\n" + args.join("\n"));
}

// node_modules/@yume-chan/adb/esm/utils/ref.js
var { setInterval, clearInterval } = globalThis;
var Ref = class {
  #intervalId;
  constructor(options) {
    if (!options?.unref) {
      this.ref();
    }
  }
  ref() {
    this.#intervalId = setInterval(() => {
    }, 60 * 1e3);
  }
  unref() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = void 0;
    }
  }
};

// node_modules/@yume-chan/adb/esm/utils/sequence-equal.js
function sequenceEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

// node_modules/@yume-chan/adb/esm/commands/reverse.js
var AdbReverseStringResponse = struct({
  length: string(4),
  content: string({
    field: "length",
    convert(value) {
      return Number.parseInt(value, 16);
    },
    back(value) {
      return value.toString(16).padStart(4, "0");
    }
  })
}, { littleEndian: true });
var AdbReverseError = class extends Error {
  constructor(message) {
    super(message);
  }
};
var AdbReverseNotSupportedError = class extends AdbReverseError {
  constructor() {
    super("ADB reverse tunnel is not supported on this device when connected wirelessly.");
  }
};
var AdbReverseErrorResponse = extend(AdbReverseStringResponse, {}, {
  postDeserialize(value) {
    if (value.content === "more than one device/emulator") {
      throw new AdbReverseNotSupportedError();
    } else {
      throw new AdbReverseError(value.content);
    }
  }
});
function decimalToNumber(buffer2) {
  let value = 0;
  for (const byte of buffer2) {
    if (byte < 48 || byte > 57) {
      return value;
    }
    value = value * 10 + byte - 48;
  }
  return value;
}
var OKAY = encodeUtf8("OKAY");
var AdbReverseService = class extends AdbServiceBase {
  #deviceAddressToLocalAddress = /* @__PURE__ */ new Map();
  async createBufferedStream(service) {
    const socket = await this.adb.createSocket(service);
    return new BufferedReadableStream(socket.readable);
  }
  async sendRequest(service) {
    const stream = await this.createBufferedStream(service);
    const response = await stream.readExactly(4);
    if (!sequenceEqual(response, OKAY)) {
      await AdbReverseErrorResponse.deserialize(stream);
    }
    return stream;
  }
  /**
   * Get a list of all reverse port forwarding on the device.
   */
  async list() {
    const stream = await this.createBufferedStream("reverse:list-forward");
    const response = await AdbReverseStringResponse.deserialize(stream);
    return response.content.split("\n").filter((line) => !!line).map((line) => {
      const [deviceSerial, localName, remoteName] = line.split(" ");
      return { deviceSerial, localName, remoteName };
    });
  }
  /**
   * Add a reverse port forwarding for a program that already listens on a port.
   */
  async addExternal(deviceAddress, localAddress) {
    const stream = await this.sendRequest(`reverse:forward:${deviceAddress};${localAddress}`);
    if (deviceAddress.startsWith("tcp:")) {
      const position = stream.position;
      try {
        const length = hexToNumber(await stream.readExactly(4));
        const port = decimalToNumber(await stream.readExactly(length));
        deviceAddress = `tcp:${port}`;
      } catch (e) {
        if (e instanceof ExactReadableEndedError && stream.position === position) {
        } else {
          throw e;
        }
      }
    }
    return deviceAddress;
  }
  /**
   * Add a reverse port forwarding.
   */
  async add(deviceAddress, handler, localAddress) {
    localAddress = await this.adb.transport.addReverseTunnel(handler, localAddress);
    try {
      deviceAddress = await this.addExternal(deviceAddress, localAddress);
      this.#deviceAddressToLocalAddress.set(deviceAddress, localAddress);
      return deviceAddress;
    } catch (e) {
      await this.adb.transport.removeReverseTunnel(localAddress);
      throw e;
    }
  }
  /**
   * Remove a reverse port forwarding.
   */
  async remove(deviceAddress) {
    const localAddress = this.#deviceAddressToLocalAddress.get(deviceAddress);
    if (localAddress) {
      await this.adb.transport.removeReverseTunnel(localAddress);
    }
    await this.sendRequest(`reverse:killforward:${deviceAddress}`);
  }
  /**
   * Remove all reverse port forwarding, including the ones added by other programs.
   */
  async removeAll() {
    await this.adb.transport.clearReverseTunnels();
    this.#deviceAddressToLocalAddress.clear();
    await this.sendRequest(`reverse:killforward-all`);
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/none/process.js
var AdbNoneProtocolProcessImpl = class {
  #socket;
  get stdin() {
    return this.#socket.writable;
  }
  get output() {
    return this.#socket.readable;
  }
  #exited;
  get exited() {
    return this.#exited;
  }
  constructor(socket, signal) {
    this.#socket = socket;
    if (signal) {
      const exited = new PromiseResolver();
      this.#socket.closed.then(() => exited.resolve(void 0), (e) => exited.reject(e));
      signal.addEventListener("abort", () => {
        exited.reject(signal.reason);
        this.#socket.close();
      });
      this.#exited = exited.promise;
    } else {
      this.#exited = this.#socket.closed;
    }
  }
  kill() {
    return this.#socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/none/pty.js
var AdbNoneProtocolPtyProcess = class {
  #socket;
  #writer;
  #input;
  get input() {
    return this.#input;
  }
  get output() {
    return this.#socket.readable;
  }
  get exited() {
    return this.#socket.closed;
  }
  constructor(socket) {
    this.#socket = socket;
    this.#writer = this.#socket.writable.getWriter();
    this.#input = new maybe_consumable_exports.WritableStream({
      write: (chunk) => this.#writer.write(chunk)
    });
  }
  sigint() {
    return this.#writer.write(new Uint8Array([3]));
  }
  kill() {
    return this.#socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/utils.js
function escapeArg(s) {
  let result = "";
  result += `'`;
  let base = 0;
  while (true) {
    const found = s.indexOf(`'`, base);
    if (found === -1) {
      result += s.substring(base);
      break;
    }
    result += s.substring(base, found);
    result += String.raw`'\''`;
    base = found + 1;
  }
  result += `'`;
  return result;
}
function splitCommand(command) {
  const result = [];
  let quote;
  let isEscaped = false;
  let start = 0;
  for (let i = 0, len = command.length; i < len; i += 1) {
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    const char = command.charAt(i);
    switch (char) {
      case " ":
        if (!quote && i !== start) {
          result.push(command.substring(start, i));
          start = i + 1;
        }
        break;
      case "'":
      case '"':
        if (!quote) {
          quote = char;
        } else if (char === quote) {
          quote = void 0;
        }
        break;
      case "\\":
        isEscaped = true;
        break;
    }
  }
  if (start < command.length) {
    result.push(command.substring(start));
  }
  return result;
}

// node_modules/@yume-chan/adb/esm/commands/subprocess/none/spawner.js
var AdbNoneProtocolSpawner = class {
  #spawn;
  constructor(spawn) {
    this.#spawn = spawn;
  }
  spawn(command, signal) {
    signal?.throwIfAborted();
    if (typeof command === "string") {
      command = splitCommand(command);
    }
    return this.#spawn(command, signal);
  }
  async spawnWait(command) {
    const process = await this.spawn(command);
    return await process.output.pipeThrough(new ConcatBufferStream());
  }
  async spawnWaitText(command) {
    const process = await this.spawn(command);
    return await process.output.pipeThrough(new TextDecoderStream()).pipeThrough(new ConcatStringStream());
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/none/service.js
var AdbNoneProtocolSubprocessService = class extends AdbNoneProtocolSpawner {
  #adb;
  get adb() {
    return this.#adb;
  }
  constructor(adb) {
    super(async (command, signal) => {
      const socket = await this.#adb.createSocket(`exec:${command.join(" ")}`);
      if (signal?.aborted) {
        await socket.close();
        throw signal.reason;
      }
      return new AdbNoneProtocolProcessImpl(socket, signal);
    });
    this.#adb = adb;
  }
  async pty(command) {
    if (command === void 0) {
      command = "";
    } else if (Array.isArray(command)) {
      command = command.join(" ");
    }
    return new AdbNoneProtocolPtyProcess(
      // https://github.com/microsoft/typescript/issues/17002
      await this.#adb.createSocket(`shell:${command}`)
    );
  }
};

// node_modules/@yume-chan/adb/esm/features.js
var AdbFeature = {
  ShellV2: "shell_v2",
  Cmd: "cmd",
  StatV2: "stat_v2",
  ListV2: "ls_v2",
  FixedPushMkdir: "fixed_push_mkdir",
  Abb: "abb",
  AbbExec: "abb_exec",
  SendReceiveV2: "sendrecv_v2",
  DelayedAck: "delayed_ack"
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/shell/shared.js
var AdbShellProtocolId = {
  Stdin: 0,
  Stdout: 1,
  Stderr: 2,
  Exit: 3,
  CloseStdin: 4,
  WindowSizeChange: 5
};
var AdbShellProtocolPacket = struct({
  id: u8(),
  data: buffer(u32)
}, { littleEndian: true });

// node_modules/@yume-chan/adb/esm/commands/subprocess/shell/process.js
var AdbShellProtocolProcessImpl = class {
  #socket;
  #writer;
  #stdin;
  get stdin() {
    return this.#stdin;
  }
  #stdout;
  get stdout() {
    return this.#stdout;
  }
  #stderr;
  get stderr() {
    return this.#stderr;
  }
  #exited;
  get exited() {
    return this.#exited;
  }
  constructor(socket, signal) {
    this.#socket = socket;
    let stdoutController;
    let stderrController;
    this.#stdout = new PushReadableStream((controller) => {
      stdoutController = controller;
    });
    this.#stderr = new PushReadableStream((controller) => {
      stderrController = controller;
    });
    const exited = new PromiseResolver();
    this.#exited = exited.promise;
    socket.readable.pipeThrough(new StructDeserializeStream(AdbShellProtocolPacket)).pipeTo(new WritableStream({
      write: async (chunk) => {
        switch (chunk.id) {
          case AdbShellProtocolId.Exit:
            exited.resolve(chunk.data[0]);
            break;
          case AdbShellProtocolId.Stdout:
            await stdoutController.enqueue(chunk.data);
            break;
          case AdbShellProtocolId.Stderr:
            await stderrController.enqueue(chunk.data);
            break;
          default:
            break;
        }
      }
    })).then(() => {
      stdoutController.close();
      stderrController.close();
      exited.reject(new Error("Socket ended without exit message"));
    }, (e) => {
      stdoutController.error(e);
      stderrController.error(e);
      exited.reject(e);
    });
    if (signal) {
      signal.addEventListener("abort", () => {
        exited.reject(signal.reason);
        this.#socket.close();
      });
    }
    this.#writer = this.#socket.writable.getWriter();
    this.#stdin = new maybe_consumable_exports.WritableStream({
      write: async (chunk) => {
        await this.#writer.write(AdbShellProtocolPacket.serialize({
          id: AdbShellProtocolId.Stdin,
          data: chunk
        }));
      },
      close: () => (
        // Only shell protocol + raw mode supports closing stdin
        this.#writer.write(AdbShellProtocolPacket.serialize({
          id: AdbShellProtocolId.CloseStdin,
          data: EmptyUint8Array
        }))
      )
    });
  }
  kill() {
    return this.#socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/shell/pty.js
var AdbShellProtocolPtyProcess = class {
  #socket;
  #writer;
  #input;
  get input() {
    return this.#input;
  }
  #stdout;
  get output() {
    return this.#stdout;
  }
  #exited = new PromiseResolver();
  get exited() {
    return this.#exited.promise;
  }
  constructor(socket) {
    this.#socket = socket;
    let stdoutController;
    this.#stdout = new PushReadableStream((controller) => {
      stdoutController = controller;
    });
    socket.readable.pipeThrough(new StructDeserializeStream(AdbShellProtocolPacket)).pipeTo(new WritableStream({
      write: async (chunk) => {
        switch (chunk.id) {
          case AdbShellProtocolId.Exit:
            this.#exited.resolve(chunk.data[0]);
            break;
          case AdbShellProtocolId.Stdout:
            await stdoutController.enqueue(chunk.data);
            break;
        }
      }
    })).then(() => {
      stdoutController.close();
      this.#exited.reject(new Error("Socket ended without exit message"));
    }, (e) => {
      stdoutController.error(e);
      this.#exited.reject(e);
    });
    this.#writer = this.#socket.writable.getWriter();
    this.#input = new maybe_consumable_exports.WritableStream({
      write: (chunk) => this.#writeStdin(chunk)
    });
  }
  #writeStdin(chunk) {
    return this.#writer.write(AdbShellProtocolPacket.serialize({
      id: AdbShellProtocolId.Stdin,
      data: chunk
    }));
  }
  async resize(rows, cols) {
    await this.#writer.write(AdbShellProtocolPacket.serialize({
      id: AdbShellProtocolId.WindowSizeChange,
      // The "correct" format is `${rows}x${cols},${x_pixels}x${y_pixels}`
      // However, according to https://linux.die.net/man/4/tty_ioctl
      // `x_pixels` and `y_pixels` are unused, so always sending `0` should be fine.
      data: encodeUtf8(`${rows}x${cols},0x0\0`)
    }));
  }
  sigint() {
    return this.#writeStdin(new Uint8Array([3]));
  }
  kill() {
    return this.#socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/shell/spawner.js
var AdbShellProtocolSpawner = class {
  #spawn;
  constructor(spawn) {
    this.#spawn = spawn;
  }
  spawn(command, signal) {
    signal?.throwIfAborted();
    if (typeof command === "string") {
      command = splitCommand(command);
    }
    return this.#spawn(command, signal);
  }
  async spawnWait(command) {
    const process = await this.spawn(command);
    const [stdout, stderr, exitCode] = await Promise.all([
      process.stdout.pipeThrough(new ConcatBufferStream()),
      process.stderr.pipeThrough(new ConcatBufferStream()),
      process.exited
    ]);
    return { stdout, stderr, exitCode };
  }
  async spawnWaitText(command) {
    const process = await this.spawn(command);
    const [stdout, stderr, exitCode] = await Promise.all([
      process.stdout.pipeThrough(new TextDecoderStream()).pipeThrough(new ConcatStringStream()),
      process.stderr.pipeThrough(new TextDecoderStream()).pipeThrough(new ConcatStringStream()),
      process.exited
    ]);
    return { stdout, stderr, exitCode };
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/shell/service.js
var AdbShellProtocolSubprocessService = class extends AdbShellProtocolSpawner {
  #adb;
  get adb() {
    return this.#adb;
  }
  get isSupported() {
    return this.#adb.canUseFeature(AdbFeature.ShellV2);
  }
  constructor(adb) {
    super(async (command, signal) => {
      const socket = await this.#adb.createSocket(`shell,v2,raw:${command.join(" ")}`);
      if (signal?.aborted) {
        await socket.close();
        throw signal.reason;
      }
      return new AdbShellProtocolProcessImpl(socket, signal);
    });
    this.#adb = adb;
  }
  async pty(options) {
    let service = "shell,v2,pty";
    if (options?.terminalType) {
      service += `,TERM=` + options.terminalType;
    }
    service += ":";
    if (options) {
      if (typeof options.command === "string") {
        service += options.command;
      } else if (Array.isArray(options.command)) {
        service += options.command.join(" ");
      }
    }
    return new AdbShellProtocolPtyProcess(await this.#adb.createSocket(service));
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/service.js
var AdbSubprocessService = class {
  #adb;
  get adb() {
    return this.#adb;
  }
  #noneProtocol;
  get noneProtocol() {
    return this.#noneProtocol;
  }
  #shellProtocol;
  get shellProtocol() {
    return this.#shellProtocol;
  }
  constructor(adb) {
    this.#adb = adb;
    this.#noneProtocol = new AdbNoneProtocolSubprocessService(adb);
    if (adb.canUseFeature(AdbFeature.ShellV2)) {
      this.#shellProtocol = new AdbShellProtocolSubprocessService(adb);
    }
  }
};

// node_modules/@yume-chan/adb/esm/commands/sync/response.js
function encodeAsciiUnchecked(value) {
  const result = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    result[i] = value.charCodeAt(i);
  }
  return result;
}
// @__NO_SIDE_EFFECTS__
function adbSyncEncodeId(value) {
  const buffer2 = encodeAsciiUnchecked(value);
  return getUint32LittleEndian(buffer2, 0);
}
var AdbSyncResponseId = {
  Entry: /* @__PURE__ */ adbSyncEncodeId("DENT"),
  Entry2: /* @__PURE__ */ adbSyncEncodeId("DNT2"),
  Lstat: /* @__PURE__ */ adbSyncEncodeId("STAT"),
  Stat: /* @__PURE__ */ adbSyncEncodeId("STA2"),
  Lstat2: /* @__PURE__ */ adbSyncEncodeId("LST2"),
  Done: /* @__PURE__ */ adbSyncEncodeId("DONE"),
  Data: /* @__PURE__ */ adbSyncEncodeId("DATA"),
  Ok: /* @__PURE__ */ adbSyncEncodeId("OKAY"),
  Fail: /* @__PURE__ */ adbSyncEncodeId("FAIL")
};
var AdbSyncError = class extends Error {
};
var AdbSyncFailResponse = struct({ message: string(u32) }, {
  littleEndian: true,
  postDeserialize(value) {
    throw new AdbSyncError(value.message);
  }
});
async function adbSyncReadResponse(stream, id, type) {
  if (typeof id === "string") {
    id = /* @__PURE__ */ adbSyncEncodeId(id);
  }
  const buffer2 = await stream.readExactly(4);
  switch (getUint32LittleEndian(buffer2, 0)) {
    case AdbSyncResponseId.Fail:
      await AdbSyncFailResponse.deserialize(stream);
      throw new Error("Unreachable");
    case id:
      return await type.deserialize(stream);
    default:
      throw new Error(`Expected '${id}', but got '${decodeUtf8(buffer2)}'`);
  }
}
async function* adbSyncReadResponses(stream, id, type) {
  if (typeof id === "string") {
    id = /* @__PURE__ */ adbSyncEncodeId(id);
  }
  while (true) {
    const buffer2 = await stream.readExactly(4);
    switch (getUint32LittleEndian(buffer2, 0)) {
      case AdbSyncResponseId.Fail:
        await AdbSyncFailResponse.deserialize(stream);
        unreachable();
      case AdbSyncResponseId.Done:
        await stream.readExactly(type.size);
        return;
      case id:
        yield await type.deserialize(stream);
        break;
      default:
        throw new Error(`Expected '${id}' or '${AdbSyncResponseId.Done}', but got '${decodeUtf8(buffer2)}'`);
    }
  }
}

// node_modules/@yume-chan/adb/esm/commands/sync/request.js
var AdbSyncRequestId = {
  List: adbSyncEncodeId("LIST"),
  ListV2: adbSyncEncodeId("LIS2"),
  Send: adbSyncEncodeId("SEND"),
  SendV2: adbSyncEncodeId("SND2"),
  Lstat: adbSyncEncodeId("STAT"),
  Stat: adbSyncEncodeId("STA2"),
  LstatV2: adbSyncEncodeId("LST2"),
  Data: adbSyncEncodeId("DATA"),
  Done: adbSyncEncodeId("DONE"),
  Receive: adbSyncEncodeId("RECV")
};
var AdbSyncNumberRequest = struct({ id: u32, arg: u32 }, { littleEndian: true });
async function adbSyncWriteRequest(writable, id, value) {
  if (typeof id === "string") {
    id = adbSyncEncodeId(id);
  }
  if (typeof value === "number") {
    await writable.write(AdbSyncNumberRequest.serialize({ id, arg: value }));
    return;
  }
  if (typeof value === "string") {
    value = encodeUtf8(value);
  }
  await writable.write(AdbSyncNumberRequest.serialize({ id, arg: value.length }));
  await writable.write(value);
}

// node_modules/@yume-chan/adb/esm/commands/sync/stat.js
var LinuxFileType = {
  Directory: 4,
  File: 8,
  Link: 10
};
var AdbSyncLstatResponse = struct({ mode: u32, size: u32, mtime: u32 }, {
  littleEndian: true,
  extra: {
    get type() {
      return this.mode >> 12;
    },
    get permission() {
      return this.mode & 4095;
    }
  },
  postDeserialize(value) {
    if (value.mode === 0 && value.size === 0 && value.mtime === 0) {
      throw new Error("lstat error");
    }
    return value;
  }
});
var AdbSyncStatErrorCode = {
  SUCCESS: 0,
  EACCES: 13,
  EEXIST: 17,
  EFAULT: 14,
  EFBIG: 27,
  EINTR: 4,
  EINVAL: 22,
  EIO: 5,
  EISDIR: 21,
  ELOOP: 40,
  EMFILE: 24,
  ENAMETOOLONG: 36,
  ENFILE: 23,
  ENOENT: 2,
  ENOMEM: 12,
  ENOSPC: 28,
  ENOTDIR: 20,
  EOVERFLOW: 75,
  EPERM: 1,
  EROFS: 30,
  ETXTBSY: 26
};
var AdbSyncStatErrorName = /* @__PURE__ */ (() => Object.fromEntries(Object.entries(AdbSyncStatErrorCode).map(([key, value]) => [
  value,
  key
])))();
var AdbSyncStatResponse = struct({
  error: u32(),
  dev: u64,
  ino: u64,
  mode: u32,
  nlink: u32,
  uid: u32,
  gid: u32,
  size: u64,
  atime: u64,
  mtime: u64,
  ctime: u64
}, {
  littleEndian: true,
  extra: {
    get type() {
      return this.mode >> 12;
    },
    get permission() {
      return this.mode & 4095;
    }
  },
  postDeserialize(value) {
    if (value.error) {
      throw new Error(AdbSyncStatErrorName[value.error]);
    }
    return value;
  }
});
async function adbSyncLstat(socket, path, v2) {
  const locked = await socket.lock();
  try {
    if (v2) {
      await adbSyncWriteRequest(locked, AdbSyncRequestId.LstatV2, path);
      return await adbSyncReadResponse(locked, AdbSyncResponseId.Lstat2, AdbSyncStatResponse);
    } else {
      await adbSyncWriteRequest(locked, AdbSyncRequestId.Lstat, path);
      const response = await adbSyncReadResponse(locked, AdbSyncResponseId.Lstat, AdbSyncLstatResponse);
      return {
        mode: response.mode,
        // Convert to `BigInt` to make it compatible with `AdbSyncStatResponse`
        size: BigInt(response.size),
        mtime: BigInt(response.mtime),
        get type() {
          return response.type;
        },
        get permission() {
          return response.permission;
        }
      };
    }
  } finally {
    locked.release();
  }
}
async function adbSyncStat(socket, path) {
  const locked = await socket.lock();
  try {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.Stat, path);
    return await adbSyncReadResponse(locked, AdbSyncResponseId.Stat, AdbSyncStatResponse);
  } finally {
    locked.release();
  }
}

// node_modules/@yume-chan/adb/esm/commands/sync/list.js
var AdbSyncEntryResponse = extend(AdbSyncLstatResponse, {
  name: string(u32)
});
var AdbSyncEntry2Response = extend(AdbSyncStatResponse, {
  name: string(u32)
});
async function* adbSyncOpenDirV2(socket, path) {
  const locked = await socket.lock();
  try {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.ListV2, path);
    for await (const item of adbSyncReadResponses(locked, AdbSyncResponseId.Entry2, AdbSyncEntry2Response)) {
      if (item.error !== AdbSyncStatErrorCode.SUCCESS) {
        continue;
      }
      yield item;
    }
  } finally {
    locked.release();
  }
}
async function* adbSyncOpenDirV1(socket, path) {
  const locked = await socket.lock();
  try {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.List, path);
    for await (const item of adbSyncReadResponses(locked, AdbSyncResponseId.Entry, AdbSyncEntryResponse)) {
      yield item;
    }
  } finally {
    locked.release();
  }
}
async function* adbSyncOpenDir(socket, path, v2) {
  if (v2) {
    yield* adbSyncOpenDirV2(socket, path);
  } else {
    for await (const item of adbSyncOpenDirV1(socket, path)) {
      yield {
        mode: item.mode,
        size: BigInt(item.size),
        mtime: BigInt(item.mtime),
        get type() {
          return item.type;
        },
        get permission() {
          return item.permission;
        },
        name: item.name
      };
    }
  }
}

// node_modules/@yume-chan/adb/esm/commands/sync/pull.js
var AdbSyncDataResponse = struct({ data: buffer(u32) }, { littleEndian: true });
async function* adbSyncPullGenerator(socket, path) {
  const locked = await socket.lock();
  let done = false;
  try {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.Receive, path);
    for await (const packet of adbSyncReadResponses(locked, AdbSyncResponseId.Data, AdbSyncDataResponse)) {
      yield packet.data;
    }
    done = true;
  } catch (e) {
    done = true;
    throw e;
  } finally {
    if (!done) {
      for await (const packet of adbSyncReadResponses(locked, AdbSyncResponseId.Data, AdbSyncDataResponse)) {
        void packet;
      }
    }
    locked.release();
  }
}
function adbSyncPull(socket, path) {
  return ReadableStream2.from(adbSyncPullGenerator(socket, path));
}

// node_modules/@yume-chan/adb/esm/commands/sync/push.js
var ADB_SYNC_MAX_PACKET_SIZE = 64 * 1024;
var AdbSyncOkResponse = struct({ unused: u32 }, { littleEndian: true });
async function pipeFileData(locked, file, packetSize, mtime) {
  const abortController = new AbortController();
  file.pipeThrough(new DistributionStream(packetSize, true)).pipeTo(new maybe_consumable_exports.WritableStream({
    write(chunk) {
      return adbSyncWriteRequest(locked, AdbSyncRequestId.Data, chunk);
    }
  }), { signal: abortController.signal }).then(async () => {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.Done, mtime);
    await locked.flush();
  }, NOOP2);
  await adbSyncReadResponse(locked, AdbSyncResponseId.Ok, AdbSyncOkResponse).catch((e) => {
    abortController.abort();
    throw e;
  });
}
async function adbSyncPushV1({ socket, filename, file, type = LinuxFileType.File, permission = 438, mtime = Date.now() / 1e3 | 0, packetSize = ADB_SYNC_MAX_PACKET_SIZE }) {
  const locked = await socket.lock();
  try {
    const mode = type << 12 | permission;
    const pathAndMode = `${filename},${mode.toString()}`;
    await adbSyncWriteRequest(locked, AdbSyncRequestId.Send, pathAndMode);
    await pipeFileData(locked, file, packetSize, mtime);
  } finally {
    locked.release();
  }
}
var AdbSyncSendV2Flags = {
  None: 0,
  Brotli: 1,
  /**
   * 2
   */
  Lz4: 1 << 1,
  /**
   * 4
   */
  Zstd: 1 << 2,
  DryRun: 2147483648
};
var AdbSyncSendV2Request = struct({ id: u32, mode: u32, flags: u32() }, { littleEndian: true });
async function adbSyncPushV2({ socket, filename, file, type = LinuxFileType.File, permission = 438, mtime = Date.now() / 1e3 | 0, packetSize = ADB_SYNC_MAX_PACKET_SIZE, dryRun = false }) {
  const locked = await socket.lock();
  try {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.SendV2, filename);
    const mode = type << 12 | permission;
    let flags = AdbSyncSendV2Flags.None;
    if (dryRun) {
      flags |= AdbSyncSendV2Flags.DryRun;
    }
    await locked.write(AdbSyncSendV2Request.serialize({
      id: AdbSyncRequestId.SendV2,
      mode,
      flags
    }));
    await pipeFileData(locked, file, packetSize, mtime);
  } finally {
    locked.release();
  }
}
function adbSyncPush(options) {
  if (options.v2) {
    return adbSyncPushV2(options);
  }
  if (options.dryRun) {
    throw new Error("dryRun is not supported in v1");
  }
  return adbSyncPushV1(options);
}

// node_modules/@yume-chan/adb/esm/commands/sync/socket.js
var AdbSyncSocketLocked = class {
  #writer;
  #readable;
  #socketLock;
  #writeLock = new AutoResetEvent();
  #combiner;
  get position() {
    return this.#readable.position;
  }
  constructor(writer, readable, bufferSize, lock) {
    this.#writer = writer;
    this.#readable = readable;
    this.#socketLock = lock;
    this.#combiner = new BufferCombiner(bufferSize);
  }
  #write(buffer2) {
    return Consumable.WritableStream.write(this.#writer, buffer2);
  }
  async flush() {
    try {
      await this.#writeLock.wait();
      const buffer2 = this.#combiner.flush();
      if (buffer2) {
        await this.#write(buffer2);
      }
    } finally {
      this.#writeLock.notifyOne();
    }
  }
  async write(data) {
    try {
      await this.#writeLock.wait();
      for (const buffer2 of this.#combiner.push(data)) {
        await this.#write(buffer2);
      }
    } finally {
      this.#writeLock.notifyOne();
    }
  }
  async readExactly(length) {
    await this.flush();
    return await this.#readable.readExactly(length);
  }
  release() {
    this.#combiner.flush();
    this.#socketLock.notifyOne();
  }
  async close() {
    await this.#readable.cancel();
  }
};
var AdbSyncSocket = class {
  #lock = new AutoResetEvent();
  #socket;
  #locked;
  constructor(socket, bufferSize) {
    this.#socket = socket;
    this.#locked = new AdbSyncSocketLocked(socket.writable.getWriter(), new BufferedReadableStream(socket.readable), bufferSize, this.#lock);
  }
  async lock() {
    await this.#lock.wait();
    return this.#locked;
  }
  async close() {
    await this.#locked.close();
    await this.#socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/sync/sync.js
function dirname(path) {
  const end = path.lastIndexOf("/");
  if (end === -1) {
    throw new Error(`Invalid path`);
  }
  if (end === 0) {
    return "/";
  }
  return path.substring(0, end);
}
var AdbSync = class {
  _adb;
  _socket;
  #supportsStat;
  #supportsListV2;
  #fixedPushMkdir;
  #supportsSendReceiveV2;
  #needPushMkdirWorkaround;
  get supportsStat() {
    return this.#supportsStat;
  }
  get supportsListV2() {
    return this.#supportsListV2;
  }
  get fixedPushMkdir() {
    return this.#fixedPushMkdir;
  }
  get supportsSendReceiveV2() {
    return this.#supportsSendReceiveV2;
  }
  get needPushMkdirWorkaround() {
    return this.#needPushMkdirWorkaround;
  }
  constructor(adb, socket) {
    this._adb = adb;
    this._socket = new AdbSyncSocket(socket, adb.maxPayloadSize);
    this.#supportsStat = adb.canUseFeature(AdbFeature.StatV2);
    this.#supportsListV2 = adb.canUseFeature(AdbFeature.ListV2);
    this.#fixedPushMkdir = adb.canUseFeature(AdbFeature.FixedPushMkdir);
    this.#supportsSendReceiveV2 = adb.canUseFeature(AdbFeature.SendReceiveV2);
    this.#needPushMkdirWorkaround = this._adb.canUseFeature(AdbFeature.ShellV2) && !this.fixedPushMkdir;
  }
  /**
   * Gets information of a file or folder.
   *
   * If `path` points to a symbolic link, the returned information is about the link itself (with `type` being `LinuxFileType.Link`).
   */
  async lstat(path) {
    return await adbSyncLstat(this._socket, path, this.#supportsStat);
  }
  /**
   * Gets the information of a file or folder.
   *
   * If `path` points to a symbolic link, it will be resolved and the returned information is about the target (with `type` being `LinuxFileType.File` or `LinuxFileType.Directory`).
   */
  async stat(path) {
    if (!this.#supportsStat) {
      throw new Error("Not supported");
    }
    return await adbSyncStat(this._socket, path);
  }
  /**
   * Checks if `path` is a directory, or a symbolic link to a directory.
   *
   * This uses `lstat` internally, thus works on all Android versions.
   */
  async isDirectory(path) {
    try {
      await this.lstat(path + "/");
      return true;
    } catch {
      return false;
    }
  }
  opendir(path) {
    return adbSyncOpenDir(this._socket, path, this.supportsListV2);
  }
  async readdir(path) {
    const results = [];
    for await (const entry of this.opendir(path)) {
      results.push(entry);
    }
    return results;
  }
  /**
   * Reads the content of a file on device.
   *
   * @param filename The full path of the file on device to read.
   * @returns A `ReadableStream` that contains the file content.
   */
  read(filename) {
    return adbSyncPull(this._socket, filename);
  }
  /**
   * Writes a file on device. If the file name already exists, it will be overwritten.
   *
   * @param options The content and options of the file to write.
   */
  async write(options) {
    if (this.needPushMkdirWorkaround) {
      await this._adb.subprocess.noneProtocol.spawnWait([
        "mkdir",
        "-p",
        escapeArg(dirname(options.filename))
      ]);
    }
    await adbSyncPush({
      v2: this.supportsSendReceiveV2,
      socket: this._socket,
      ...options
    });
  }
  lockSocket() {
    return this._socket.lock();
  }
  dispose() {
    return this._socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/tcpip.js
function parsePort(value) {
  if (!value || value === "0") {
    return void 0;
  }
  return Number.parseInt(value, 10);
}
var AdbTcpIpService = class extends AdbServiceBase {
  async getListenAddresses() {
    const serviceListenAddresses = await this.adb.getProp("service.adb.listen_addrs");
    const servicePort = await this.adb.getProp("service.adb.tcp.port");
    const persistPort = await this.adb.getProp("persist.adb.tcp.port");
    return {
      serviceListenAddresses: serviceListenAddresses != "" ? serviceListenAddresses.split(",") : [],
      servicePort: parsePort(servicePort),
      persistPort: parsePort(persistPort)
    };
  }
  async setPort(port) {
    if (port <= 0) {
      throw new TypeError(`Invalid port ${port}`);
    }
    const output = await this.adb.createSocketAndWait(`tcpip:${port}`);
    if (output !== `restarting in TCP mode port: ${port}
`) {
      throw new Error(output);
    }
    return output;
  }
  async disable() {
    const output = await this.adb.createSocketAndWait("usb:");
    if (output !== "restarting in USB mode\n") {
      throw new Error(output);
    }
    return output;
  }
};

// node_modules/@yume-chan/adb/esm/adb.js
var Adb = class {
  #transport;
  get transport() {
    return this.#transport;
  }
  get serial() {
    return this.#transport.serial;
  }
  get maxPayloadSize() {
    return this.#transport.maxPayloadSize;
  }
  get banner() {
    return this.#transport.banner;
  }
  get disconnected() {
    return this.#transport.disconnected;
  }
  get clientFeatures() {
    return this.#transport.clientFeatures;
  }
  get deviceFeatures() {
    return this.banner.features;
  }
  subprocess;
  power;
  reverse;
  tcpip;
  constructor(transport) {
    this.#transport = transport;
    this.subprocess = new AdbSubprocessService(this);
    this.power = new AdbPower(this);
    this.reverse = new AdbReverseService(this);
    this.tcpip = new AdbTcpIpService(this);
  }
  canUseFeature(feature) {
    return this.clientFeatures.includes(feature) && this.deviceFeatures.includes(feature);
  }
  /**
   * Creates a new ADB Socket to the specified service or socket address.
   */
  async createSocket(service) {
    return this.#transport.connect(service);
  }
  async createSocketAndWait(service) {
    const socket = await this.createSocket(service);
    return await socket.readable.pipeThrough(new TextDecoderStream()).pipeThrough(new ConcatStringStream());
  }
  getProp(key) {
    return this.subprocess.noneProtocol.spawnWaitText(["getprop", key]).then((output) => output.trim());
  }
  rm(filenames, options) {
    const args = ["rm"];
    if (options?.recursive) {
      args.push("-r");
    }
    if (options?.force) {
      args.push("-f");
    }
    if (Array.isArray(filenames)) {
      for (const filename of filenames) {
        args.push(escapeArg(filename));
      }
    } else {
      args.push(escapeArg(filenames));
    }
    args.push("</dev/null");
    return this.subprocess.noneProtocol.spawnWaitText(args);
  }
  async sync() {
    const socket = await this.createSocket("sync:");
    return new AdbSync(this, socket);
  }
  async framebuffer() {
    return framebuffer(this);
  }
  async close() {
    await this.#transport.close();
  }
};

// node_modules/@yume-chan/adb/esm/banner.js
var AdbBannerKey = {
  Product: "ro.product.name",
  Model: "ro.product.model",
  Device: "ro.product.device",
  Features: "features"
};
var AdbBanner = class _AdbBanner {
  static parse(banner) {
    let state;
    let product;
    let model;
    let device;
    let features = [];
    const pieces = banner.split("::");
    if (pieces.length > 1) {
      state = pieces[0].trim() || void 0;
      const props = pieces[1];
      for (const prop of props.split(";")) {
        if (!prop) {
          continue;
        }
        const keyValue = prop.split("=");
        if (keyValue.length !== 2) {
          continue;
        }
        const [key, value] = keyValue;
        switch (key) {
          case AdbBannerKey.Product:
            product = value;
            break;
          case AdbBannerKey.Model:
            model = value;
            break;
          case AdbBannerKey.Device:
            device = value;
            break;
          case AdbBannerKey.Features:
            features = value.split(",");
            break;
        }
      }
    }
    return new _AdbBanner(state, product, model, device, features);
  }
  #state;
  get state() {
    return this.#state;
  }
  #product;
  get product() {
    return this.#product;
  }
  #model;
  get model() {
    return this.#model;
  }
  #device;
  get device() {
    return this.#device;
  }
  #features = [];
  get features() {
    return this.#features;
  }
  // eslint-disable-next-line @typescript-eslint/max-params
  constructor(state, product, model, device, features) {
    this.#state = state;
    this.#product = product;
    this.#model = model;
    this.#device = device;
    this.#features = features;
  }
};

// node_modules/@yume-chan/adb/esm/daemon/crypto.js
function getBigUint(array, byteOffset, length) {
  let result = 0n;
  for (let i = byteOffset; i < byteOffset + length; i += 8) {
    result <<= 64n;
    const value = getUint64BigEndian(array, i);
    result |= value;
  }
  return result;
}
function setBigUint(array, byteOffset, length, value, littleEndian) {
  if (littleEndian) {
    while (value > 0n) {
      setInt64LittleEndian(array, byteOffset, value);
      byteOffset += 8;
      value >>= 64n;
    }
  } else {
    let position = byteOffset + length - 8;
    while (value > 0n) {
      setInt64BigEndian(array, position, value);
      position -= 8;
      value >>= 64n;
    }
  }
}
var RsaPrivateKeyNOffset = 38;
var RsaPrivateKeyNLength = 2048 / 8;
var RsaPrivateKeyDOffset = 303;
var RsaPrivateKeyDLength = 2048 / 8;
function rsaParsePrivateKey(key) {
  const n = getBigUint(key, RsaPrivateKeyNOffset, RsaPrivateKeyNLength);
  const d = getBigUint(key, RsaPrivateKeyDOffset, RsaPrivateKeyDLength);
  return [n, d];
}
function nonNegativeMod(m, d) {
  const r = m % d;
  if (r > 0) {
    return r;
  }
  return r + (d > 0 ? d : -d);
}
function modInverse(a, m) {
  a = nonNegativeMod(a, m);
  if (!a || m < 2) {
    return NaN;
  }
  const s = [];
  let b = m;
  while (b) {
    [a, b] = [b, a % b];
    s.push({ a, b });
  }
  if (a !== 1) {
    return NaN;
  }
  let x = 1;
  let y = 0;
  for (let i = s.length - 2; i >= 0; i -= 1) {
    [x, y] = [y, x - y * Math.floor(s[i].a / s[i].b)];
  }
  return nonNegativeMod(y, m);
}
var ModulusLengthInBytes = 2048 / 8;
var ModulusLengthInWords = ModulusLengthInBytes / 4;
function adbGetPublicKeySize() {
  return 4 + 4 + ModulusLengthInBytes + ModulusLengthInBytes + 4;
}
function adbGeneratePublicKey(privateKey, output) {
  let outputType;
  const outputLength = adbGetPublicKeySize();
  if (!output) {
    output = new Uint8Array(outputLength);
    outputType = "Uint8Array";
  } else {
    if (output.length < outputLength) {
      throw new TypeError("output buffer is too small");
    }
    outputType = "number";
  }
  const outputView = new DataView(output.buffer, output.byteOffset, output.length);
  let outputOffset = 0;
  outputView.setUint32(outputOffset, ModulusLengthInWords, true);
  outputOffset += 4;
  const [n] = rsaParsePrivateKey(privateKey);
  const n0inv = -modInverse(Number(n % 2n ** 32n), 2 ** 32);
  outputView.setInt32(outputOffset, n0inv, true);
  outputOffset += 4;
  setBigUint(output, outputOffset, ModulusLengthInBytes, n, true);
  outputOffset += ModulusLengthInBytes;
  const rr = 2n ** 4096n % n;
  setBigUint(output, outputOffset, ModulusLengthInBytes, rr, true);
  outputOffset += ModulusLengthInBytes;
  outputView.setUint32(outputOffset, 65537, true);
  outputOffset += 4;
  if (outputType === "Uint8Array") {
    return output;
  } else {
    return outputLength;
  }
}
function powMod(base, exponent, modulus) {
  if (modulus === 1n) {
    return 0n;
  }
  let r = 1n;
  base = base % modulus;
  while (exponent > 0n) {
    if (BigInt.asUintN(1, exponent) === 1n) {
      r = r * base % modulus;
    }
    base = base * base % modulus;
    exponent >>= 1n;
  }
  return r;
}
var SHA1_DIGEST_LENGTH = 20;
var ASN1_SEQUENCE = 48;
var ASN1_OCTET_STRING = 4;
var ASN1_NULL = 5;
var ASN1_OID = 6;
var SHA1_DIGEST_INFO = new Uint8Array([
  ASN1_SEQUENCE,
  13 + SHA1_DIGEST_LENGTH,
  ASN1_SEQUENCE,
  9,
  // SHA-1 (1 3 14 3 2 26)
  ASN1_OID,
  5,
  1 * 40 + 3,
  14,
  3,
  2,
  26,
  ASN1_NULL,
  0,
  ASN1_OCTET_STRING,
  SHA1_DIGEST_LENGTH
]);
function rsaSign(privateKey, data) {
  const [n, d] = rsaParsePrivateKey(privateKey);
  const padded = new Uint8Array(256);
  let index = 0;
  padded[index] = 0;
  index += 1;
  padded[index] = 1;
  index += 1;
  const fillLength = padded.length - SHA1_DIGEST_INFO.length - data.length - 1;
  while (index < fillLength) {
    padded[index] = 255;
    index += 1;
  }
  padded[index] = 0;
  index += 1;
  padded.set(SHA1_DIGEST_INFO, index);
  index += SHA1_DIGEST_INFO.length;
  padded.set(data, index);
  const signature = powMod(getBigUint(padded, 0, padded.length), d, n);
  setBigUint(padded, 0, padded.length, signature, false);
  return padded;
}

// node_modules/@yume-chan/adb/esm/daemon/packet.js
var AdbCommand = {
  Auth: 1213486401,
  // 'AUTH'
  Close: 1163086915,
  // 'CLSE'
  Connect: 1314410051,
  // 'CNXN'
  Okay: 1497451343,
  // 'OKAY'
  Open: 1313165391,
  // 'OPEN'
  Write: 1163154007
  // 'WRTE'
};
var AdbPacketHeader = struct({
  command: u32,
  arg0: u32,
  arg1: u32,
  payloadLength: u32,
  checksum: u32,
  magic: s32
}, { littleEndian: true });
var AdbPacket = extend(AdbPacketHeader, {
  payload: buffer("payloadLength")
});
function calculateChecksum(payload) {
  return payload.reduce((result, item) => result + item, 0);
}
var AdbPacketSerializeStream = class extends TransformStream {
  constructor() {
    const headerBuffer = new Uint8Array(AdbPacketHeader.size);
    super({
      transform: async (chunk, controller) => {
        await chunk.tryConsume(async (chunk2) => {
          const init = chunk2;
          init.payloadLength = init.payload.length;
          AdbPacketHeader.serialize(init, headerBuffer);
          await Consumable.ReadableStream.enqueue(controller, headerBuffer);
          if (init.payloadLength) {
            await Consumable.ReadableStream.enqueue(controller, init.payload);
          }
        });
      }
    });
  }
};

// node_modules/@yume-chan/adb/esm/daemon/auth.js
var AdbAuthType = {
  Token: 1,
  Signature: 2,
  PublicKey: 3
};
var AdbSignatureAuthenticator = async function* (credentialStore, getNextRequest) {
  for await (const key of credentialStore.iterateKeys()) {
    const packet = await getNextRequest();
    if (packet.arg0 !== AdbAuthType.Token) {
      return;
    }
    const signature = rsaSign(key.buffer, packet.payload);
    yield {
      command: AdbCommand.Auth,
      arg0: AdbAuthType.Signature,
      arg1: 0,
      payload: signature
    };
  }
};
var AdbPublicKeyAuthenticator = async function* (credentialStore, getNextRequest) {
  const packet = await getNextRequest();
  if (packet.arg0 !== AdbAuthType.Token) {
    return;
  }
  let privateKey;
  for await (const key of credentialStore.iterateKeys()) {
    privateKey = key;
    break;
  }
  if (!privateKey) {
    privateKey = await credentialStore.generateKey();
  }
  const publicKeyLength = adbGetPublicKeySize();
  const [publicKeyBase64Length] = calculateBase64EncodedLength(publicKeyLength);
  const nameBuffer = privateKey.name?.length ? encodeUtf8(privateKey.name) : EmptyUint8Array;
  const publicKeyBuffer = new Uint8Array(publicKeyBase64Length + (nameBuffer.length ? nameBuffer.length + 1 : 0) + // Space character + name
  1);
  adbGeneratePublicKey(privateKey.buffer, publicKeyBuffer);
  encodeBase64(publicKeyBuffer.subarray(0, publicKeyLength), publicKeyBuffer);
  if (nameBuffer.length) {
    publicKeyBuffer[publicKeyBase64Length] = 32;
    publicKeyBuffer.set(nameBuffer, publicKeyBase64Length + 1);
  }
  yield {
    command: AdbCommand.Auth,
    arg0: AdbAuthType.PublicKey,
    arg1: 0,
    payload: publicKeyBuffer
  };
};
var ADB_DEFAULT_AUTHENTICATORS = [
  AdbSignatureAuthenticator,
  AdbPublicKeyAuthenticator
];
var AdbAuthenticationProcessor = class {
  authenticators;
  #credentialStore;
  #pendingRequest = new PromiseResolver();
  #iterator;
  constructor(authenticators, credentialStore) {
    this.authenticators = authenticators;
    this.#credentialStore = credentialStore;
  }
  #getNextRequest = () => {
    return this.#pendingRequest.promise;
  };
  async *#invokeAuthenticator() {
    for (const authenticator of this.authenticators) {
      for await (const packet of authenticator(this.#credentialStore, this.#getNextRequest)) {
        this.#pendingRequest = new PromiseResolver();
        yield packet;
      }
    }
  }
  async process(packet) {
    if (!this.#iterator) {
      this.#iterator = this.#invokeAuthenticator();
    }
    this.#pendingRequest.resolve(packet);
    const result = await this.#iterator.next();
    if (result.done) {
      throw new Error("No authenticator can handle the request");
    }
    return result.value;
  }
  dispose() {
    void this.#iterator?.return?.();
  }
};

// node_modules/@yume-chan/adb/esm/daemon/socket.js
var AdbDaemonSocketController = class {
  #dispatcher;
  localId;
  remoteId;
  localCreated;
  service;
  #readable;
  #readableController;
  get readable() {
    return this.#readable;
  }
  #writableController;
  writable;
  #closed = false;
  #closedPromise = new PromiseResolver();
  get closed() {
    return this.#closedPromise.promise;
  }
  #socket;
  get socket() {
    return this.#socket;
  }
  #availableWriteBytesChanged;
  /**
   * When delayed ack is disabled, returns `Infinity` if the socket is ready to write
   * (exactly one packet can be written no matter how large it is), or `-1` if the socket
   * is waiting for ack message.
   *
   * When delayed ack is enabled, returns a non-negative finite number indicates the number of
   * bytes that can be written to the socket before waiting for ack message.
   */
  #availableWriteBytes = 0;
  constructor(options) {
    this.#dispatcher = options.dispatcher;
    this.localId = options.localId;
    this.remoteId = options.remoteId;
    this.localCreated = options.localCreated;
    this.service = options.service;
    this.#readable = new PushReadableStream((controller) => {
      this.#readableController = controller;
    });
    this.writable = new maybe_consumable_exports.WritableStream({
      start: (controller) => {
        this.#writableController = controller;
        controller.signal.addEventListener("abort", () => {
          this.#availableWriteBytesChanged?.reject(controller.signal.reason);
        });
      },
      write: async (data) => {
        const size = data.length;
        const chunkSize = this.#dispatcher.options.maxPayloadSize;
        for (let start = 0, end = chunkSize; start < size; start = end, end += chunkSize) {
          const chunk = data.subarray(start, end);
          await this.#writeChunk(chunk);
        }
      }
    });
    this.#socket = new AdbDaemonSocket(this);
    this.#availableWriteBytes = options.availableWriteBytes;
  }
  async #writeChunk(data) {
    const length = data.length;
    while (this.#availableWriteBytes < length) {
      const resolver = new PromiseResolver();
      this.#availableWriteBytesChanged = resolver;
      await resolver.promise;
    }
    if (this.#availableWriteBytes === Infinity) {
      this.#availableWriteBytes = -1;
    } else {
      this.#availableWriteBytes -= length;
    }
    await this.#dispatcher.sendPacket(AdbCommand.Write, this.localId, this.remoteId, data);
  }
  async enqueue(data) {
    await this.#readableController.enqueue(data);
  }
  ack(bytes) {
    this.#availableWriteBytes += bytes;
    this.#availableWriteBytesChanged?.resolve();
  }
  async close() {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#availableWriteBytesChanged?.reject(new Error("Socket closed"));
    try {
      this.#writableController.error(new Error("Socket closed"));
    } catch {
    }
    await this.#dispatcher.sendPacket(AdbCommand.Close, this.localId, this.remoteId, EmptyUint8Array);
  }
  dispose() {
    this.#readableController.close();
    this.#closedPromise.resolve(void 0);
  }
};
var AdbDaemonSocket = class {
  #controller;
  get localId() {
    return this.#controller.localId;
  }
  get remoteId() {
    return this.#controller.remoteId;
  }
  get localCreated() {
    return this.#controller.localCreated;
  }
  get service() {
    return this.#controller.service;
  }
  get readable() {
    return this.#controller.readable;
  }
  get writable() {
    return this.#controller.writable;
  }
  get closed() {
    return this.#controller.closed;
  }
  constructor(controller) {
    this.#controller = controller;
  }
  close() {
    return this.#controller.close();
  }
};

// node_modules/@yume-chan/adb/esm/daemon/dispatcher.js
var AdbPacketDispatcher = class {
  // ADB socket id starts from 1
  // (0 means open failed)
  #initializers = new AsyncOperationManager(1);
  /**
   * Socket local ID to the socket controller.
   */
  #sockets = /* @__PURE__ */ new Map();
  #writer;
  options;
  #closed = false;
  #disconnected = new PromiseResolver();
  get disconnected() {
    return this.#disconnected.promise;
  }
  #incomingSocketHandlers = /* @__PURE__ */ new Map();
  #readAbortController = new AbortController();
  constructor(connection, options) {
    this.options = options;
    if (this.options.initialDelayedAckBytes < 0) {
      this.options.initialDelayedAckBytes = 0;
    }
    connection.readable.pipeTo(new WritableStream({
      write: async (packet, controller) => {
        switch (packet.command) {
          case AdbCommand.Close:
            await this.#handleClose(packet);
            break;
          case AdbCommand.Okay:
            this.#handleOkay(packet);
            break;
          case AdbCommand.Open:
            await this.#handleOpen(packet);
            break;
          case AdbCommand.Write:
            this.#handleWrite(packet).catch((e) => {
              controller.error(e);
            });
            break;
          default:
            throw new Error(`Unknown command: ${packet.command.toString(16)}`);
        }
      }
    }), {
      preventCancel: options.preserveConnection ?? false,
      signal: this.#readAbortController.signal
    }).then(() => {
      this.#dispose();
    }, (e) => {
      if (!this.#closed) {
        this.#disconnected.reject(e);
      }
      this.#dispose();
    });
    this.#writer = connection.writable.getWriter();
  }
  async #handleClose(packet) {
    if (packet.arg0 === 0 && this.#initializers.reject(packet.arg1, new Error("Socket open failed"))) {
      return;
    }
    const socket = this.#sockets.get(packet.arg1);
    if (socket) {
      await socket.close();
      socket.dispose();
      this.#sockets.delete(packet.arg1);
      return;
    }
  }
  #handleOkay(packet) {
    let ackBytes;
    if (this.options.initialDelayedAckBytes !== 0) {
      if (packet.payload.length !== 4) {
        throw new Error("Invalid OKAY packet. Payload size should be 4");
      }
      ackBytes = getUint32LittleEndian(packet.payload, 0);
    } else {
      if (packet.payload.length !== 0) {
        throw new Error("Invalid OKAY packet. Payload size should be 0");
      }
      ackBytes = Infinity;
    }
    if (this.#initializers.resolve(packet.arg1, {
      remoteId: packet.arg0,
      availableWriteBytes: ackBytes
    })) {
      return;
    }
    const socket = this.#sockets.get(packet.arg1);
    if (socket) {
      socket.ack(ackBytes);
      return;
    }
    void this.sendPacket(AdbCommand.Close, packet.arg1, packet.arg0, EmptyUint8Array);
  }
  #sendOkay(localId, remoteId, ackBytes) {
    let payload;
    if (this.options.initialDelayedAckBytes !== 0) {
      payload = new Uint8Array(4);
      setUint32LittleEndian(payload, 0, ackBytes);
    } else {
      payload = EmptyUint8Array;
    }
    return this.sendPacket(AdbCommand.Okay, localId, remoteId, payload);
  }
  async #handleOpen(packet) {
    const [localId] = this.#initializers.add();
    this.#initializers.resolve(localId, void 0);
    const remoteId = packet.arg0;
    let availableWriteBytes = packet.arg1;
    let service = decodeUtf8(packet.payload);
    if (service.endsWith("\0")) {
      service = service.substring(0, service.length - 1);
    }
    if (this.options.initialDelayedAckBytes === 0) {
      if (availableWriteBytes !== 0) {
        throw new Error("Invalid OPEN packet. arg1 should be 0");
      }
      availableWriteBytes = Infinity;
    } else {
      if (availableWriteBytes === 0) {
        throw new Error("Invalid OPEN packet. arg1 should be greater than 0");
      }
    }
    const handler = this.#incomingSocketHandlers.get(service);
    if (!handler) {
      await this.sendPacket(AdbCommand.Close, 0, remoteId, EmptyUint8Array);
      return;
    }
    const controller = new AdbDaemonSocketController({
      dispatcher: this,
      localId,
      remoteId,
      localCreated: false,
      service,
      availableWriteBytes
    });
    try {
      await handler(controller.socket);
      this.#sockets.set(localId, controller);
      await this.#sendOkay(localId, remoteId, this.options.initialDelayedAckBytes);
    } catch {
      await this.sendPacket(AdbCommand.Close, 0, remoteId, EmptyUint8Array);
    }
  }
  async #handleWrite(packet) {
    const socket = this.#sockets.get(packet.arg1);
    if (!socket) {
      throw new Error(`Unknown local socket id: ${packet.arg1}`);
    }
    let handled = false;
    const promises = [
      (async () => {
        await socket.enqueue(packet.payload);
        await this.#sendOkay(packet.arg1, packet.arg0, packet.payload.length);
        handled = true;
      })()
    ];
    if (this.options.readTimeLimit) {
      promises.push((async () => {
        await delay(this.options.readTimeLimit);
        if (!handled) {
          throw new Error(`readable of \`${socket.service}\` has stalled for ${this.options.readTimeLimit} milliseconds`);
        }
      })());
    }
    await Promise.race(promises);
  }
  async createSocket(service) {
    if (this.options.appendNullToServiceString) {
      service += "\0";
    }
    const [localId, initializer] = this.#initializers.add();
    await this.sendPacket(AdbCommand.Open, localId, this.options.initialDelayedAckBytes, service);
    const { remoteId, availableWriteBytes } = await initializer;
    const controller = new AdbDaemonSocketController({
      dispatcher: this,
      localId,
      remoteId,
      localCreated: true,
      service,
      availableWriteBytes
    });
    this.#sockets.set(localId, controller);
    return controller.socket;
  }
  addReverseTunnel(service, handler) {
    this.#incomingSocketHandlers.set(service, handler);
  }
  removeReverseTunnel(address) {
    this.#incomingSocketHandlers.delete(address);
  }
  clearReverseTunnels() {
    this.#incomingSocketHandlers.clear();
  }
  async sendPacket(command, arg0, arg1, payload) {
    if (typeof payload === "string") {
      payload = encodeUtf8(payload);
    }
    if (payload.length > this.options.maxPayloadSize) {
      throw new TypeError("payload too large");
    }
    await Consumable.WritableStream.write(this.#writer, {
      command,
      arg0,
      arg1,
      payload,
      checksum: this.options.calculateChecksum ? calculateChecksum(payload) : 0,
      magic: command ^ 4294967295
    });
  }
  async close() {
    await Promise.all(Array.from(this.#sockets.values(), (socket) => socket.close()));
    this.#closed = true;
    this.#readAbortController.abort();
    if (this.options.preserveConnection) {
      this.#writer.releaseLock();
    } else {
      await this.#writer.close();
    }
  }
  #dispose() {
    for (const socket of this.#sockets.values()) {
      socket.dispose();
    }
    this.#disconnected.resolve();
  }
};

// node_modules/@yume-chan/adb/esm/daemon/transport.js
var ADB_DAEMON_VERSION_OMIT_CHECKSUM = 16777217;
var ADB_DAEMON_DEFAULT_FEATURES = /* @__PURE__ */ (() => [
  AdbFeature.ShellV2,
  AdbFeature.Cmd,
  AdbFeature.StatV2,
  AdbFeature.ListV2,
  AdbFeature.FixedPushMkdir,
  "apex",
  AdbFeature.Abb,
  // only tells the client the symlink timestamp issue in `adb push --sync` has been fixed.
  // No special handling required.
  "fixed_push_symlink_timestamp",
  AdbFeature.AbbExec,
  "remount_shell",
  "track_app",
  AdbFeature.SendReceiveV2,
  "sendrecv_v2_brotli",
  "sendrecv_v2_lz4",
  "sendrecv_v2_zstd",
  "sendrecv_v2_dry_run_send",
  AdbFeature.DelayedAck
])();
var ADB_DAEMON_DEFAULT_INITIAL_PAYLOAD_SIZE = 32 * 1024 * 1024;
var AdbDaemonTransport = class _AdbDaemonTransport {
  /**
   * Authenticate with the ADB Daemon and create a new transport.
   */
  static async authenticate({ serial, connection, credentialStore, authenticators = ADB_DEFAULT_AUTHENTICATORS, features = ADB_DAEMON_DEFAULT_FEATURES, initialDelayedAckBytes = ADB_DAEMON_DEFAULT_INITIAL_PAYLOAD_SIZE, ...options }) {
    let version = 16777217;
    let maxPayloadSize = 1024 * 1024;
    const resolver = new PromiseResolver();
    const authProcessor = new AdbAuthenticationProcessor(authenticators, credentialStore);
    const abortController = new AbortController();
    const pipe = connection.readable.pipeTo(new WritableStream({
      async write(packet) {
        switch (packet.command) {
          case AdbCommand.Connect:
            version = Math.min(version, packet.arg0);
            maxPayloadSize = Math.min(maxPayloadSize, packet.arg1);
            resolver.resolve(decodeUtf8(packet.payload));
            break;
          case AdbCommand.Auth: {
            const response = await authProcessor.process(packet);
            await sendPacket(response);
            break;
          }
          default:
            break;
        }
      }
    }), {
      // Don't cancel the source ReadableStream on AbortSignal abort.
      preventCancel: true,
      signal: abortController.signal
    }).then(() => {
      resolver.reject(new Error("Connection closed unexpectedly"));
    }, (e) => {
      resolver.reject(e);
    });
    const writer = connection.writable.getWriter();
    async function sendPacket(init) {
      init.checksum = calculateChecksum(init.payload);
      init.magic = init.command ^ 4294967295;
      await Consumable.WritableStream.write(writer, init);
    }
    const actualFeatures = features.slice();
    if (initialDelayedAckBytes <= 0) {
      const index = features.indexOf(AdbFeature.DelayedAck);
      if (index !== -1) {
        actualFeatures.splice(index, 1);
      }
    }
    let banner;
    try {
      await sendPacket({
        command: AdbCommand.Connect,
        arg0: version,
        arg1: maxPayloadSize,
        // The terminating `;` is required in formal definition
        // But ADB daemon (all versions) can still work without it
        payload: encodeUtf8(`host::features=${actualFeatures.join(",")}`)
      });
      banner = await resolver.promise;
    } finally {
      abortController.abort();
      writer.releaseLock();
      await pipe;
    }
    return new _AdbDaemonTransport({
      serial,
      connection,
      version,
      maxPayloadSize,
      banner,
      features: actualFeatures,
      initialDelayedAckBytes,
      ...options
    });
  }
  #connection;
  get connection() {
    return this.#connection;
  }
  #dispatcher;
  #serial;
  get serial() {
    return this.#serial;
  }
  #protocolVersion;
  get protocolVersion() {
    return this.#protocolVersion;
  }
  get maxPayloadSize() {
    return this.#dispatcher.options.maxPayloadSize;
  }
  #banner;
  get banner() {
    return this.#banner;
  }
  get disconnected() {
    return this.#dispatcher.disconnected;
  }
  #clientFeatures;
  get clientFeatures() {
    return this.#clientFeatures;
  }
  constructor({ serial, connection, version, banner, features = ADB_DAEMON_DEFAULT_FEATURES, initialDelayedAckBytes, ...options }) {
    this.#serial = serial;
    this.#connection = connection;
    this.#banner = AdbBanner.parse(banner);
    this.#clientFeatures = features;
    if (features.includes(AdbFeature.DelayedAck)) {
      if (initialDelayedAckBytes <= 0) {
        throw new TypeError("`initialDelayedAckBytes` must be greater than 0 when DelayedAck feature is enabled.");
      }
      if (!this.#banner.features.includes(AdbFeature.DelayedAck)) {
        initialDelayedAckBytes = 0;
      }
    } else {
      initialDelayedAckBytes = 0;
    }
    let calculateChecksum2;
    let appendNullToServiceString;
    if (version >= ADB_DAEMON_VERSION_OMIT_CHECKSUM) {
      calculateChecksum2 = false;
      appendNullToServiceString = false;
    } else {
      calculateChecksum2 = true;
      appendNullToServiceString = true;
    }
    this.#dispatcher = new AdbPacketDispatcher(connection, {
      calculateChecksum: calculateChecksum2,
      appendNullToServiceString,
      initialDelayedAckBytes,
      ...options
    });
    this.#protocolVersion = version;
  }
  connect(service) {
    return this.#dispatcher.createSocket(service);
  }
  addReverseTunnel(handler, address) {
    if (!address) {
      const id = Math.random().toString().substring(2);
      address = `localabstract:reverse_${id}`;
    }
    this.#dispatcher.addReverseTunnel(address, handler);
    return address;
  }
  removeReverseTunnel(address) {
    this.#dispatcher.removeReverseTunnel(address);
  }
  clearReverseTunnels() {
    this.#dispatcher.clearReverseTunnels();
  }
  close() {
    return this.#dispatcher.close();
  }
};

// node_modules/@yume-chan/adb/esm/server/commands/m-dns.js
var MDnsCommands = class {
  #client;
  constructor(client) {
    this.#client = client;
  }
  async check() {
    const connection = await this.#client.createConnection("host:mdns:check");
    try {
      const response = await connection.readString();
      return !response.startsWith("ERROR:");
    } finally {
      await connection.dispose();
    }
  }
  async getServices() {
    const connection = await this.#client.createConnection("host:mdns:services");
    try {
      const response = await connection.readString();
      return response.split("\n").filter(Boolean).map((line) => {
        const parts = line.split("	");
        return {
          name: parts[0],
          service: parts[1],
          address: parts[2]
        };
      });
    } finally {
      await connection.dispose();
    }
  }
};

// node_modules/@yume-chan/adb/esm/server/stream.js
var OKAY2 = encodeUtf8("OKAY");
var FAIL = encodeUtf8("FAIL");
var AdbServerStream = class {
  #connection;
  #buffered;
  #writer;
  constructor(connection) {
    this.#connection = connection;
    this.#buffered = new BufferedReadableStream(connection.readable);
    this.#writer = connection.writable.getWriter();
  }
  readExactly(length) {
    return this.#buffered.readExactly(length);
  }
  readString = bipedal(function* (then) {
    const data = yield* then(this.readExactly(4));
    const length = hexToNumber(data);
    if (length === 0) {
      return "";
    } else {
      const decoder = new TextDecoder();
      let result = "";
      const iterator = this.#buffered.iterateExactly(length);
      while (true) {
        const { done, value } = iterator.next();
        if (done) {
          break;
        }
        result += decoder.decode(yield* then(value), { stream: true });
      }
      result += decoder.decode();
      return result;
    }
  });
  async readOkay() {
    const response = await this.readExactly(4);
    if (sequenceEqual(response, OKAY2)) {
      return;
    }
    if (sequenceEqual(response, FAIL)) {
      const reason = await this.readString();
      throw new Error(reason);
    }
    throw new Error(`Unexpected response: ${decodeUtf8(response)}`);
  }
  async writeString(value) {
    const encoded = encodeUtf8(value);
    const buffer2 = new Uint8Array(4 + encoded.length);
    write4HexDigits(buffer2, 0, encoded.length);
    buffer2.set(encoded, 4);
    await this.#writer.write(buffer2);
  }
  release() {
    this.#writer.releaseLock();
    return {
      readable: this.#buffered.release(),
      writable: this.#connection.writable,
      closed: this.#connection.closed,
      close: () => this.#connection.close()
    };
  }
  async dispose() {
    void tryCancel(this.#buffered);
    void tryClose(this.#writer);
    await this.#connection.close();
  }
};

// node_modules/@yume-chan/adb/esm/server/commands/wireless.js
var NetworkError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "NetworkError";
  }
};
var UnauthorizedError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedError";
  }
};
var AlreadyConnectedError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "AlreadyConnectedError";
  }
};
var WirelessCommands = class {
  #client;
  constructor(client) {
    this.#client = client;
  }
  /**
   * `adb pair <password> <address>`
   */
  async pair(address, password) {
    const connection = await this.#client.createConnection(`host:pair:${password}:${address}`);
    try {
      const response = await connection.readExactly(4);
      if (sequenceEqual(response, FAIL)) {
        throw new Error(await connection.readString());
      }
      const length = hexToNumber(response);
      await connection.readExactly(length);
    } finally {
      await connection.dispose();
    }
  }
  /**
   * `adb connect <address>`
   */
  async connect(address) {
    const connection = await this.#client.createConnection(`host:connect:${address}`);
    try {
      const response = await connection.readString();
      switch (response) {
        case `already connected to ${address}`:
          throw new AlreadyConnectedError(response);
        case `failed to connect to ${address}`:
        // `adb pair` mode not authorized
        case `failed to authenticate to ${address}`:
          throw new UnauthorizedError(response);
        case `connected to ${address}`:
          return;
        default:
          throw new NetworkError(response);
      }
    } finally {
      await connection.dispose();
    }
  }
  /**
   * `adb disconnect <address>`
   */
  async disconnect(address) {
    const connection = await this.#client.createConnection(`host:disconnect:${address}`);
    try {
      await connection.readString();
    } finally {
      await connection.dispose();
    }
  }
};

// node_modules/@yume-chan/adb/esm/server/observer.js
function unorderedRemove(array, index) {
  if (index < 0 || index >= array.length) {
    return;
  }
  array[index] = array[array.length - 1];
  array.length -= 1;
}
function filterDeviceStates(devices, states) {
  return devices.filter((device) => states.includes(device.state));
}
var AdbServerDeviceObserverOwner = class {
  current = [];
  #client;
  #stream;
  #observers = [];
  constructor(client) {
    this.#client = client;
  }
  async #receive(stream) {
    const response = await stream.readString();
    const next = AdbServerClient.parseDeviceList(response);
    const removed = this.current.slice();
    const added = [];
    for (const nextDevice of next) {
      const index = removed.findIndex((device) => device.transportId === nextDevice.transportId);
      if (index === -1) {
        added.push(nextDevice);
        continue;
      }
      unorderedRemove(removed, index);
    }
    this.current = next;
    if (added.length) {
      for (const observer of this.#observers) {
        const filtered = filterDeviceStates(added, observer.includeStates);
        if (filtered.length) {
          observer.onDeviceAdd.fire(filtered);
        }
      }
    }
    if (removed.length) {
      for (const observer of this.#observers) {
        const filtered = filterDeviceStates(removed, observer.includeStates);
        if (filtered.length) {
          observer.onDeviceRemove.fire(removed);
        }
      }
    }
    for (const observer of this.#observers) {
      const filtered = filterDeviceStates(this.current, observer.includeStates);
      observer.onListChange.fire(filtered);
    }
  }
  async #receiveLoop(stream) {
    try {
      while (true) {
        await this.#receive(stream);
      }
    } catch (e) {
      this.#stream = void 0;
      for (const observer of this.#observers) {
        observer.onError.fire(e);
      }
    }
  }
  async #connect() {
    const stream = await this.#client.createConnection(
      "host:track-devices-l",
      // Each individual observer will ref depending on their options
      { unref: true }
    );
    await this.#receive(stream);
    void this.#receiveLoop(stream);
    return stream;
  }
  async #handleObserverStop(stream) {
    if (this.#observers.length === 0) {
      this.#stream = void 0;
      await stream.dispose();
    }
  }
  async createObserver(options) {
    options?.signal?.throwIfAborted();
    let current = [];
    const onDeviceAdd = new EventEmitter();
    const onDeviceRemove = new EventEmitter();
    const onListChange = new StickyEventEmitter();
    const onError = new StickyEventEmitter();
    const includeStates = options?.includeStates ?? [
      "device",
      "unauthorized"
    ];
    const observer = {
      includeStates,
      onDeviceAdd,
      onDeviceRemove,
      onListChange,
      onError
    };
    this.#observers.push(observer);
    onListChange.event((value) => current = value);
    let stream;
    if (!this.#stream) {
      this.#stream = this.#connect();
      try {
        stream = await this.#stream;
      } catch (e) {
        this.#stream = void 0;
        throw e;
      }
    } else {
      stream = await this.#stream;
      onListChange.fire(filterDeviceStates(this.current, includeStates));
    }
    const ref = new Ref(options);
    const stop = async () => {
      unorderedRemove(this.#observers, this.#observers.indexOf(observer));
      await this.#handleObserverStop(stream);
      ref.unref();
    };
    if (options?.signal) {
      if (options.signal.aborted) {
        await stop();
        throw options.signal.reason;
      }
      options.signal.addEventListener("abort", () => void stop());
    }
    return {
      onDeviceAdd: onDeviceAdd.event,
      onDeviceRemove: onDeviceRemove.event,
      onListChange: onListChange.event,
      onError: onError.event,
      get current() {
        return current;
      },
      stop
    };
  }
};

// node_modules/@yume-chan/adb/esm/server/transport.js
var ADB_SERVER_DEFAULT_FEATURES = /* @__PURE__ */ (() => [
  AdbFeature.ShellV2,
  AdbFeature.Cmd,
  AdbFeature.StatV2,
  AdbFeature.ListV2,
  AdbFeature.FixedPushMkdir,
  "apex",
  AdbFeature.Abb,
  // only tells the client the symlink timestamp issue in `adb push --sync` has been fixed.
  // No special handling required.
  "fixed_push_symlink_timestamp",
  AdbFeature.AbbExec,
  "remount_shell",
  "track_app",
  AdbFeature.SendReceiveV2,
  "sendrecv_v2_brotli",
  "sendrecv_v2_lz4",
  "sendrecv_v2_zstd",
  "sendrecv_v2_dry_run_send"
])();
var AdbServerTransport = class {
  #client;
  serial;
  transportId;
  maxPayloadSize = 1 * 1024 * 1024;
  banner;
  #sockets = [];
  #closed = new PromiseResolver();
  #disconnected;
  get disconnected() {
    return this.#disconnected;
  }
  get clientFeatures() {
    return ADB_SERVER_DEFAULT_FEATURES;
  }
  // eslint-disable-next-line @typescript-eslint/max-params
  constructor(client, serial, banner, transportId, disconnected) {
    this.#client = client;
    this.serial = serial;
    this.banner = banner;
    this.transportId = transportId;
    this.#disconnected = Promise.race([this.#closed.promise, disconnected]);
  }
  async connect(service) {
    const socket = await this.#client.createDeviceConnection({ transportId: this.transportId }, service);
    this.#sockets.push(socket);
    return socket;
  }
  async addReverseTunnel(handler, address) {
    return await this.#client.connector.addReverseTunnel(handler, address);
  }
  async removeReverseTunnel(address) {
    await this.#client.connector.removeReverseTunnel(address);
  }
  async clearReverseTunnels() {
    await this.#client.connector.clearReverseTunnels();
  }
  async close() {
    for (const socket of this.#sockets) {
      await socket.close();
    }
    this.#sockets.length = 0;
    this.#closed.resolve();
  }
};

// node_modules/@yume-chan/adb/esm/server/client.js
var AdbServerClient = class _AdbServerClient {
  static NetworkError = NetworkError;
  static UnauthorizedError = UnauthorizedError;
  static AlreadyConnectedError = AlreadyConnectedError;
  static parseDeviceList(value, includeStates = [
    "device",
    "unauthorized"
  ]) {
    const devices = [];
    for (const line of value.split("\n")) {
      if (!line) {
        continue;
      }
      const parts = line.split(" ").filter(Boolean);
      const serial = parts[0];
      const state = parts[1];
      if (!includeStates.includes(state)) {
        continue;
      }
      let product;
      let model;
      let device;
      let transportId;
      for (let i = 2; i < parts.length; i += 1) {
        const [key, value2] = parts[i].split(":");
        switch (key) {
          case "product":
            product = value2;
            break;
          case "model":
            model = value2;
            break;
          case "device":
            device = value2;
            break;
          case "transport_id":
            transportId = BigInt(value2);
            break;
        }
      }
      if (!transportId) {
        throw new Error(`No transport id for device ${serial}`);
      }
      devices.push({
        serial,
        state,
        authenticating: state === "unauthorized",
        product,
        model,
        device,
        transportId
      });
    }
    return devices;
  }
  static formatDeviceService(device, command) {
    if (!device) {
      return `host:${command}`;
    }
    if ("transportId" in device) {
      return `host-transport-id:${device.transportId}:${command}`;
    }
    if ("serial" in device) {
      return `host-serial:${device.serial}:${command}`;
    }
    if ("usb" in device) {
      return `host-usb:${command}`;
    }
    if ("tcp" in device) {
      return `host-local:${command}`;
    }
    throw new TypeError("Invalid device selector");
  }
  connector;
  wireless = new WirelessCommands(this);
  mDns = new MDnsCommands(this);
  #observerOwner = new AdbServerDeviceObserverOwner(this);
  constructor(connector) {
    this.connector = connector;
  }
  async createConnection(request, options) {
    const connection = await this.connector.connect(options);
    const stream = new AdbServerStream(connection);
    try {
      await stream.writeString(request);
    } catch (e) {
      await stream.dispose();
      throw e;
    }
    try {
      await raceSignal(() => stream.readOkay(), options?.signal);
      return stream;
    } catch (e) {
      await stream.dispose();
      throw e;
    }
  }
  /**
   * `adb version`
   */
  async getVersion() {
    const connection = await this.createConnection("host:version");
    try {
      const length = hexToNumber(await connection.readExactly(4));
      const version = hexToNumber(await connection.readExactly(length));
      return version;
    } finally {
      await connection.dispose();
    }
  }
  async validateVersion(minimalVersion) {
    const version = await this.getVersion();
    if (version < minimalVersion) {
      throw new Error(`adb server version (${version}) doesn't match this client (${minimalVersion})`);
    }
  }
  /**
   * `adb kill-server`
   */
  async killServer() {
    const connection = await this.createConnection("host:kill");
    await connection.dispose();
  }
  /**
   * `adb host-features`
   */
  async getServerFeatures() {
    const connection = await this.createConnection("host:host-features");
    try {
      const response = await connection.readString();
      return response.split(",");
    } finally {
      await connection.dispose();
    }
  }
  /**
   * Get a list of connected devices from ADB Server.
   *
   * Equivalent ADB Command: `adb devices -l`
   */
  async getDevices(includeStates = [
    "device",
    "unauthorized"
  ]) {
    const connection = await this.createConnection("host:devices-l");
    try {
      const response = await connection.readString();
      return _AdbServerClient.parseDeviceList(response, includeStates);
    } finally {
      await connection.dispose();
    }
  }
  /**
   * Monitors device list changes.
   */
  async trackDevices(options) {
    return this.#observerOwner.createObserver(options);
  }
  /**
   * `adb -s <device> reconnect` or `adb reconnect offline`
   */
  async reconnectDevice(device) {
    const connection = await this.createConnection(device === "offline" ? "host:reconnect-offline" : _AdbServerClient.formatDeviceService(device, "reconnect"));
    try {
      await connection.readString();
    } finally {
      await connection.dispose();
    }
  }
  /**
   * Gets the features supported by the device.
   * The transport ID of the selected device is also returned,
   * so the caller can execute other commands against the same device.
   * @param device The device selector
   * @returns The transport ID of the selected device, and the features supported by the device.
   */
  async getDeviceFeatures(device) {
    const connection = await this.createDeviceConnection(device, "host:features");
    const stream = new AdbServerStream(connection);
    try {
      const featuresString = await stream.readString();
      const features = featuresString.split(",");
      return { transportId: connection.transportId, features };
    } finally {
      await stream.dispose();
    }
  }
  /**
   * Creates a connection that will forward the service to device.
   * @param device The device selector
   * @param service The service to forward
   * @returns An `AdbServerClient.Socket` that can be used to communicate with the service
   */
  async createDeviceConnection(device, service) {
    let switchService;
    let transportId;
    if (!device) {
      await this.validateVersion(41);
      switchService = `host:tport:any`;
    } else if ("transportId" in device) {
      switchService = `host:transport-id:${device.transportId}`;
      transportId = device.transportId;
    } else if ("serial" in device) {
      await this.validateVersion(41);
      switchService = `host:tport:serial:${device.serial}`;
    } else if ("usb" in device) {
      await this.validateVersion(41);
      switchService = `host:tport:usb`;
    } else if ("tcp" in device) {
      await this.validateVersion(41);
      switchService = `host:tport:local`;
    } else {
      throw new TypeError("Invalid device selector");
    }
    const connection = await this.createConnection(switchService);
    try {
      await connection.writeString(service);
    } catch (e) {
      await connection.dispose();
      throw e;
    }
    try {
      if (transportId === void 0) {
        const array = await connection.readExactly(8);
        transportId = getUint64LittleEndian(array, 0);
      }
      await connection.readOkay();
      const socket = connection.release();
      return {
        transportId,
        service,
        readable: socket.readable,
        writable: socket.writable,
        get closed() {
          return socket.closed;
        },
        async close() {
          await socket.close();
        }
      };
    } catch (e) {
      await connection.dispose();
      throw e;
    }
  }
  async #waitForUnchecked(device, state, options) {
    let type;
    if (!device) {
      type = "any";
    } else if ("transportId" in device) {
      type = "any";
    } else if ("serial" in device) {
      type = "any";
    } else if ("usb" in device) {
      type = "usb";
    } else if ("tcp" in device) {
      type = "local";
    } else {
      throw new TypeError("Invalid device selector");
    }
    const service = _AdbServerClient.formatDeviceService(device, `wait-for-${type}-${state}`);
    const connection = await this.createConnection(service, options);
    try {
      await connection.readOkay();
    } finally {
      await connection.dispose();
    }
  }
  /**
   * Wait for a device to be connected or disconnected.
   *
   * `adb wait-for-<state>`
   *
   * @param device The device selector
   * @param state The state to wait for
   * @param options The options
   * @returns A promise that resolves when the condition is met.
   */
  async waitFor(device, state, options) {
    if (state === "disconnect") {
      await this.validateVersion(41);
    }
    return this.#waitForUnchecked(device, state, options);
  }
  async waitForDisconnect(transportId, options) {
    const serverVersion = await this.getVersion();
    if (serverVersion >= 41) {
      return this.#waitForUnchecked({ transportId }, "disconnect", options);
    } else {
      const observer = await this.trackDevices(options);
      return new Promise((resolve, reject) => {
        observer.onDeviceRemove((devices) => {
          if (devices.some((device) => device.transportId === transportId)) {
            observer.stop();
            resolve();
          }
        });
        observer.onError((e) => {
          observer.stop();
          reject(e);
        });
      });
    }
  }
  /**
   * Creates an ADB Transport for the specified device.
   */
  async createTransport(device) {
    const { transportId, features } = await this.getDeviceFeatures(device);
    const devices = await this.getDevices();
    const info = devices.find((device2) => device2.transportId === transportId);
    const banner = new AdbBanner(info?.state, info?.product, info?.model, info?.device, features);
    const waitAbortController = new AbortController();
    const disconnected = this.waitForDisconnect(transportId, {
      unref: true,
      signal: waitAbortController.signal
    });
    const transport = new AdbServerTransport(this, info?.serial ?? "", banner, transportId, disconnected);
    void transport.disconnected.finally(() => waitAbortController.abort());
    return transport;
  }
  async createAdb(device) {
    const transport = await this.createTransport(device);
    return new Adb(transport);
  }
};
async function raceSignal(callback, ...signals) {
  const abortPromise = new PromiseResolver();
  function abort() {
    abortPromise.reject(this.reason);
  }
  try {
    for (const signal of signals) {
      if (!signal) {
        continue;
      }
      if (signal.aborted) {
        throw signal.reason;
      }
      signal.addEventListener("abort", abort);
    }
    return await Promise.race([callback(), abortPromise.promise]);
  } finally {
    for (const signal of signals) {
      if (!signal) {
        continue;
      }
      signal.removeEventListener("abort", abort);
    }
  }
}

// node_modules/@yume-chan/adb-daemon-webusb/esm/error.js
var DeviceBusyError = class extends Error {
  constructor(cause) {
    super("The device is already in used by another program", {
      cause
    });
  }
};

// node_modules/@yume-chan/adb-daemon-webusb/esm/utils.js
function isErrorName(e, name) {
  return typeof e === "object" && e !== null && "name" in e && e.name === name;
}
function isUsbInterfaceFilter(filter) {
  return filter.classCode !== void 0 && filter.subclassCode !== void 0 && filter.protocolCode !== void 0;
}
function matchUsbInterfaceFilter(alternate, filter) {
  return alternate.interfaceClass === filter.classCode && alternate.interfaceSubclass === filter.subclassCode && alternate.interfaceProtocol === filter.protocolCode;
}
function findUsbInterface(device, filter) {
  for (const configuration of device.configurations) {
    for (const interface_ of configuration.interfaces) {
      for (const alternate of interface_.alternates) {
        if (matchUsbInterfaceFilter(alternate, filter)) {
          return { configuration, interface_, alternate };
        }
      }
    }
  }
  return void 0;
}
function padNumber(value) {
  return value.toString(16).padStart(4, "0");
}
function getSerialNumber(device) {
  if (device.serialNumber) {
    return device.serialNumber;
  }
  return padNumber(device.vendorId) + "x" + padNumber(device.productId);
}
function findUsbEndpoints(endpoints) {
  if (endpoints.length === 0) {
    throw new TypeError("No endpoints given");
  }
  let inEndpoint;
  let outEndpoint;
  for (const endpoint of endpoints) {
    switch (endpoint.direction) {
      case "in":
        inEndpoint = endpoint;
        if (outEndpoint) {
          return { inEndpoint, outEndpoint };
        }
        break;
      case "out":
        outEndpoint = endpoint;
        if (inEndpoint) {
          return { inEndpoint, outEndpoint };
        }
        break;
    }
  }
  if (!inEndpoint) {
    throw new TypeError("No input endpoint found.");
  }
  if (!outEndpoint) {
    throw new TypeError("No output endpoint found.");
  }
  throw new Error("unreachable");
}
function matchFilter(device, filter) {
  if (filter.vendorId !== void 0 && device.vendorId !== filter.vendorId) {
    return false;
  }
  if (filter.productId !== void 0 && device.productId !== filter.productId) {
    return false;
  }
  if (filter.serialNumber !== void 0 && getSerialNumber(device) !== filter.serialNumber) {
    return false;
  }
  if (isUsbInterfaceFilter(filter)) {
    return findUsbInterface(device, filter) || false;
  }
  return true;
}
function matchFilters(device, filters, exclusionFilters) {
  if (exclusionFilters && exclusionFilters.length > 0) {
    if (matchFilters(device, exclusionFilters)) {
      return false;
    }
  }
  for (const filter of filters) {
    const result = matchFilter(device, filter);
    if (result) {
      return result;
    }
  }
  return false;
}

// node_modules/@yume-chan/adb-daemon-webusb/esm/device.js
var AdbDefaultInterfaceFilter = {
  classCode: 255,
  subclassCode: 66,
  protocolCode: 1
};
function mergeDefaultAdbInterfaceFilter(filters) {
  if (!filters || filters.length === 0) {
    return [AdbDefaultInterfaceFilter];
  } else {
    return filters.map((filter) => ({
      ...filter,
      classCode: filter.classCode ?? AdbDefaultInterfaceFilter.classCode,
      subclassCode: filter.subclassCode ?? AdbDefaultInterfaceFilter.subclassCode,
      protocolCode: filter.protocolCode ?? AdbDefaultInterfaceFilter.protocolCode
    }));
  }
}
var AdbDaemonWebUsbConnection = class {
  #device;
  get device() {
    return this.#device;
  }
  #inEndpoint;
  get inEndpoint() {
    return this.#inEndpoint;
  }
  #outEndpoint;
  get outEndpoint() {
    return this.#outEndpoint;
  }
  #readable;
  get readable() {
    return this.#readable;
  }
  #writable;
  get writable() {
    return this.#writable;
  }
  constructor(device, inEndpoint, outEndpoint, usbManager) {
    this.#device = device;
    this.#inEndpoint = inEndpoint;
    this.#outEndpoint = outEndpoint;
    let closed2 = false;
    const duplex = new DuplexStreamFactory({
      close: async () => {
        try {
          closed2 = true;
          await device.raw.close();
        } catch {
        }
      },
      dispose: () => {
        closed2 = true;
        usbManager.removeEventListener("disconnect", handleUsbDisconnect);
      }
    });
    function handleUsbDisconnect(e) {
      if (e.device === device.raw) {
        duplex.dispose().catch(unreachable);
      }
    }
    usbManager.addEventListener("disconnect", handleUsbDisconnect);
    this.#readable = duplex.wrapReadable(new ReadableStream2({
      pull: async (controller) => {
        const packet = await this.#transferIn();
        if (packet) {
          controller.enqueue(packet);
        } else {
          controller.close();
        }
      }
    }, { highWaterMark: 0 }));
    const zeroMask = outEndpoint.packetSize - 1;
    this.#writable = pipeFrom(duplex.createWritable(new maybe_consumable_exports.WritableStream({
      write: async (chunk) => {
        try {
          await device.raw.transferOut(outEndpoint.endpointNumber, toLocalUint8Array(chunk));
          if (zeroMask && (chunk.length & zeroMask) === 0) {
            await device.raw.transferOut(outEndpoint.endpointNumber, EmptyUint8Array);
          }
        } catch (e) {
          if (closed2) {
            return;
          }
          throw e;
        }
      }
    })), new AdbPacketSerializeStream());
  }
  async #transferIn() {
    try {
      while (true) {
        const result = await this.#device.raw.transferIn(this.#inEndpoint.endpointNumber, this.#inEndpoint.packetSize);
        if (result.data.byteLength !== 24) {
          continue;
        }
        const buffer2 = new Uint8Array(result.data.buffer);
        const stream = new Uint8ArrayExactReadable(buffer2);
        const packet = AdbPacketHeader.deserialize(stream);
        if (packet.magic !== (packet.command ^ 4294967295)) {
          continue;
        }
        if (packet.payloadLength !== 0) {
          const result2 = await this.#device.raw.transferIn(this.#inEndpoint.endpointNumber, packet.payloadLength);
          packet.payload = new Uint8Array(result2.data.buffer);
        } else {
          packet.payload = EmptyUint8Array;
        }
        return packet;
      }
    } catch (e) {
      if (isErrorName(e, "NetworkError")) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 100);
        });
        if (closed) {
          return void 0;
        }
      }
      throw e;
    }
  }
};
var AdbDaemonWebUsbDevice = class _AdbDaemonWebUsbDevice {
  static DeviceBusyError = DeviceBusyError;
  #interface;
  #usbManager;
  #raw;
  get raw() {
    return this.#raw;
  }
  #serial;
  get serial() {
    return this.#serial;
  }
  get name() {
    return this.#raw.productName;
  }
  /**
   * Create a new instance of `AdbDaemonWebUsbConnection` using a specified `USBDevice` instance
   *
   * @param device The `USBDevice` instance obtained elsewhere.
   * @param filters The filters to use when searching for ADB interface. Defaults to {@link ADB_DEFAULT_DEVICE_FILTER}.
   */
  constructor(device, interface_, usbManager) {
    this.#raw = device;
    this.#serial = getSerialNumber(device);
    this.#interface = interface_;
    this.#usbManager = usbManager;
  }
  async #claimInterface() {
    if (!this.#raw.opened) {
      await this.#raw.open();
    }
    const { configuration, interface_, alternate } = this.#interface;
    if (this.#raw.configuration?.configurationValue !== configuration.configurationValue) {
      await this.#raw.selectConfiguration(configuration.configurationValue);
    }
    if (!interface_.claimed) {
      try {
        await this.#raw.claimInterface(interface_.interfaceNumber);
      } catch (e) {
        if (isErrorName(e, "NetworkError")) {
          throw new _AdbDaemonWebUsbDevice.DeviceBusyError(e);
        }
        throw e;
      }
    }
    if (interface_.alternate.alternateSetting !== alternate.alternateSetting) {
      await this.#raw.selectAlternateInterface(interface_.interfaceNumber, alternate.alternateSetting);
    }
    return findUsbEndpoints(alternate.endpoints);
  }
  /**
   * Open the device and create a new connection to the ADB Daemon.
   */
  async connect() {
    const { inEndpoint, outEndpoint } = await this.#claimInterface();
    return new AdbDaemonWebUsbConnection(this, inEndpoint, outEndpoint, this.#usbManager);
  }
};

// node_modules/@yume-chan/adb-daemon-webusb/esm/observer.js
var AdbDaemonWebUsbDeviceObserver = class _AdbDaemonWebUsbDeviceObserver {
  static async create(usb, options = {}) {
    const devices = await usb.getDevices();
    return new _AdbDaemonWebUsbDeviceObserver(usb, devices, options);
  }
  #filters;
  #exclusionFilters;
  #usbManager;
  #onDeviceAdd = new EventEmitter();
  onDeviceAdd = this.#onDeviceAdd.event;
  #onDeviceRemove = new EventEmitter();
  onDeviceRemove = this.#onDeviceRemove.event;
  #onListChange = new StickyEventEmitter();
  onListChange = this.#onListChange.event;
  current = [];
  constructor(usb, initial, options = {}) {
    this.#filters = mergeDefaultAdbInterfaceFilter(options.filters);
    this.#exclusionFilters = options.exclusionFilters;
    this.#usbManager = usb;
    this.current = initial.map((device) => this.#convertDevice(device)).filter((device) => !!device);
    this.#onListChange.fire(this.current);
    this.#usbManager.addEventListener("connect", this.#handleConnect);
    this.#usbManager.addEventListener("disconnect", this.#handleDisconnect);
  }
  #convertDevice(device) {
    const interface_ = matchFilters(device, this.#filters, this.#exclusionFilters);
    if (!interface_) {
      return void 0;
    }
    return new AdbDaemonWebUsbDevice(device, interface_, this.#usbManager);
  }
  #handleConnect = (e) => {
    const device = this.#convertDevice(e.device);
    if (!device) {
      return;
    }
    if (this.current.some((item) => item.raw === device.raw)) {
      return;
    }
    const next = this.current.slice();
    next.push(device);
    this.current = next;
    this.#onDeviceAdd.fire([device]);
    this.#onListChange.fire(this.current);
  };
  #handleDisconnect = (e) => {
    const index = this.current.findIndex((device) => device.raw === e.device);
    if (index !== -1) {
      const device = this.current[index];
      const next = this.current.slice();
      unorderedRemove(next, index);
      this.current = next;
      this.#onDeviceRemove.fire([device]);
      this.#onListChange.fire(this.current);
    }
  };
  stop() {
    this.#usbManager.removeEventListener("connect", this.#handleConnect);
    this.#usbManager.removeEventListener("disconnect", this.#handleDisconnect);
    this.#onDeviceAdd.dispose();
    this.#onDeviceRemove.dispose();
    this.#onListChange.dispose();
  }
};

// node_modules/@yume-chan/adb-daemon-webusb/esm/manager.js
var AdbDaemonWebUsbDeviceManager = class _AdbDaemonWebUsbDeviceManager {
  /**
   * Gets the instance of {@link AdbDaemonWebUsbDeviceManager} using browser WebUSB implementation.
   *
   * May be `undefined` if current runtime does not support WebUSB.
   */
  static BROWSER = /* @__PURE__ */ (() => typeof globalThis.navigator !== "undefined" && globalThis.navigator.usb ? new _AdbDaemonWebUsbDeviceManager(globalThis.navigator.usb) : void 0)();
  #usbManager;
  /**
   * Create a new instance of {@link AdbDaemonWebUsbDeviceManager} using the specified WebUSB implementation.
   * @param usbManager A WebUSB compatible interface.
   */
  constructor(usbManager) {
    this.#usbManager = usbManager;
  }
  /**
   * Call `USB#requestDevice()` to prompt the user to select a device.
   */
  async requestDevice(options = {}) {
    const filters = mergeDefaultAdbInterfaceFilter(options.filters);
    try {
      const device = await this.#usbManager.requestDevice({
        filters,
        exclusionFilters: options.exclusionFilters
      });
      const interface_ = matchFilters(device, filters, options.exclusionFilters);
      if (!interface_) {
        return void 0;
      }
      this.#usbManager.dispatchEvent(new USBConnectionEvent("connect", { device }));
      return new AdbDaemonWebUsbDevice(device, interface_, this.#usbManager);
    } catch (e) {
      if (isErrorName(e, "NotFoundError")) {
        return void 0;
      }
      throw e;
    }
  }
  /**
   * Get all connected and requested devices that match the specified filters.
   */
  async getDevices(options = {}) {
    const filters = mergeDefaultAdbInterfaceFilter(options.filters);
    const devices = await this.#usbManager.getDevices();
    const result = [];
    for (const device of devices) {
      const interface_ = matchFilters(device, filters, options.exclusionFilters);
      if (interface_) {
        result.push(new AdbDaemonWebUsbDevice(device, interface_, this.#usbManager));
      }
    }
    return result;
  }
  trackDevices(options = {}) {
    return AdbDaemonWebUsbDeviceObserver.create(this.#usbManager, options);
  }
};

// node_modules/@yume-chan/adb-credential-web/esm/index.js
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("Tango", 1);
    request.onerror = () => {
      reject(request.error);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("Authentication", { autoIncrement: true });
    };
    request.onsuccess = () => {
      const db = request.result;
      resolve(db);
    };
  });
}
async function saveKey(key) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("Authentication", "readwrite");
    const store = transaction.objectStore("Authentication");
    const putRequest = store.add(key);
    putRequest.onerror = () => {
      reject(putRequest.error);
    };
    putRequest.onsuccess = () => {
      resolve();
    };
    transaction.onerror = () => {
      reject(transaction.error);
    };
    transaction.oncomplete = () => {
      db.close();
    };
  });
}
async function getAllKeys() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("Authentication", "readonly");
    const store = transaction.objectStore("Authentication");
    const getRequest = store.getAll();
    getRequest.onerror = () => {
      reject(getRequest.error);
    };
    getRequest.onsuccess = () => {
      resolve(getRequest.result);
    };
    transaction.onerror = () => {
      reject(transaction.error);
    };
    transaction.oncomplete = () => {
      db.close();
    };
  });
}
var AdbWebCredentialStore = class {
  #appName;
  constructor(appName = "Tango") {
    this.#appName = appName;
  }
  /**
   * Generates a RSA private key and store it into LocalStorage.
   *
   * Calling this method multiple times will overwrite the previous key.
   *
   * @returns The private key in PKCS #8 format.
   */
  async generateKey() {
    const { privateKey: cryptoKey } = await crypto.subtle.generateKey({
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      // 65537
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-1"
    }, true, ["sign", "verify"]);
    const privateKey = new Uint8Array(await crypto.subtle.exportKey("pkcs8", cryptoKey));
    await saveKey(privateKey);
    return {
      buffer: privateKey,
      name: `${this.#appName}@${globalThis.location.hostname}`
    };
  }
  /**
   * Yields the stored RSA private key.
   *
   * This method returns a generator, so `for await...of...` loop should be used to read the key.
   */
  async *iterateKeys() {
    for (const key of await getAllKeys()) {
      yield {
        buffer: key,
        name: `${this.#appName}@${globalThis.location.hostname}`
      };
    }
  }
};

// node_modules/@yume-chan/android-bin/esm/index.js
var esm_exports4 = {};
__export(esm_exports4, {
  ActivityManager: () => ActivityManager,
  AdbBackup: () => AdbBackup,
  AndroidLogPriority: () => AndroidLogPriority,
  AndroidLogPriorityToCharacter: () => AndroidLogPriorityToCharacter,
  BugReport: () => BugReport,
  Cmd: () => Cmd,
  CmdNoneProtocolService: () => CmdNoneProtocolService,
  CmdShellProtocolService: () => CmdShellProtocolService,
  DemoMode: () => DemoMode,
  DemoModeMobileDataTypes: () => DemoModeMobileDataTypes,
  DemoModeSignalStrength: () => DemoModeSignalStrength,
  DemoModeStatusBarModes: () => DemoModeStatusBarModes,
  DumpSys: () => DumpSys,
  IntentBuilder: () => IntentBuilder,
  LogId: () => LogId,
  Logcat: () => Logcat,
  LogcatFormat: () => LogcatFormat,
  LoggerEntry: () => LoggerEntry,
  OverlayDisplay: () => OverlayDisplay,
  PACKAGE_MANAGER_INSTALL_OPTIONS_MAP: () => PACKAGE_MANAGER_INSTALL_OPTIONS_MAP,
  PACKAGE_MANAGER_LIST_PACKAGES_OPTIONS_MAP: () => PACKAGE_MANAGER_LIST_PACKAGES_OPTIONS_MAP,
  PackageManager: () => PackageManager,
  PackageManagerInstallLocation: () => PackageManagerInstallLocation,
  PackageManagerInstallReason: () => PackageManagerInstallReason,
  PackageManagerInstallSession: () => PackageManagerInstallSession,
  ParseError: () => ParseError,
  Settings: () => Settings,
  SettingsResetMode: () => SettingsResetMode,
  deserializeAndroidLogEntry: () => deserializeAndroidLogEntry,
  p: () => p
});

// node_modules/@yume-chan/android-bin/esm/cmd.js
var CmdNoneProtocolService = class extends AdbNoneProtocolSpawner {
  #supportsAbbExec;
  get supportsAbbExec() {
    return this.#supportsAbbExec;
  }
  #supportsCmd;
  get supportsCmd() {
    return this.#supportsCmd;
  }
  get isSupported() {
    return this.#supportsAbbExec || this.#supportsCmd;
  }
  constructor(adb, fallback) {
    super(async (command) => {
      if (this.#supportsAbbExec) {
        return new AdbNoneProtocolProcessImpl(await adb.createSocket(`abb_exec:${command.join("\0")}\0`));
      }
      if (this.#supportsCmd) {
        return adb.subprocess.noneProtocol.spawn(`cmd ${command.join(" ")}`);
      }
      if (typeof fallback === "function") {
        fallback = fallback(command[0]);
      } else if (typeof fallback === "object") {
        fallback = fallback[command[0]];
      }
      if (!fallback) {
        throw new Error("Unsupported");
      }
      const fallbackCommand = command.slice();
      fallbackCommand[0] = fallback;
      return adb.subprocess.noneProtocol.spawn(fallbackCommand);
    });
    this.#supportsCmd = adb.canUseFeature(AdbFeature.Cmd);
    this.#supportsAbbExec = adb.canUseFeature(AdbFeature.AbbExec);
  }
};
var CmdShellProtocolService = class extends AdbShellProtocolSpawner {
  #adb;
  #supportsCmd;
  get supportsCmd() {
    return this.#supportsCmd;
  }
  #supportsAbb;
  get supportsAbb() {
    return this.#supportsAbb;
  }
  get isSupported() {
    return this.#supportsAbb || this.#supportsCmd && !!this.#adb.subprocess.shellProtocol;
  }
  constructor(adb, fallback) {
    super(async (command) => {
      if (this.#supportsAbb) {
        return new AdbShellProtocolProcessImpl(await this.#adb.createSocket(`abb:${command.join("\0")}\0`));
      }
      if (!adb.subprocess.shellProtocol) {
        throw new Error("Unsupported");
      }
      if (this.#supportsCmd) {
        return adb.subprocess.shellProtocol.spawn(`cmd ${command.join(" ")}`);
      }
      if (typeof fallback === "function") {
        fallback = fallback(command[0]);
      } else if (typeof fallback === "object") {
        fallback = fallback[command[0]];
      }
      if (!fallback) {
        throw new Error("Unsupported");
      }
      const fallbackCommand = command.slice();
      fallbackCommand[0] = fallback;
      return adb.subprocess.shellProtocol.spawn(fallbackCommand);
    });
    this.#adb = adb;
    this.#supportsCmd = adb.canUseFeature(AdbFeature.Cmd);
    this.#supportsAbb = adb.canUseFeature(AdbFeature.Abb);
  }
};
var Cmd = class extends AdbServiceBase {
  #noneProtocol;
  get noneProtocol() {
    return this.#noneProtocol;
  }
  #shellProtocol;
  get shellProtocol() {
    return this.#shellProtocol;
  }
  constructor(adb, fallback) {
    super(adb);
    if (adb.canUseFeature(AdbFeature.AbbExec) || adb.canUseFeature(AdbFeature.Cmd)) {
      this.#noneProtocol = new CmdNoneProtocolService(adb, fallback);
    }
    if (adb.canUseFeature(AdbFeature.Abb) || adb.canUseFeature(AdbFeature.Cmd) && adb.canUseFeature(AdbFeature.ShellV2)) {
      this.#shellProtocol = new CmdShellProtocolService(adb, fallback);
    }
  }
};

// node_modules/@yume-chan/android-bin/esm/utils.js
function buildArguments(commands, options, map) {
  const args = commands.slice();
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (value) {
        const option = map[key];
        if (option) {
          args.push(option);
          switch (typeof value) {
            case "number":
              args.push(value.toString());
              break;
            case "string":
              args.push(value);
              break;
          }
        }
      }
    }
  }
  return args;
}

// node_modules/@yume-chan/android-bin/esm/am.js
var START_ACTIVITY_OPTIONS_MAP = {
  displayId: "--display",
  windowingMode: "--windowingMode",
  forceStop: "-S",
  user: "--user"
};
var ActivityManager = class _ActivityManager extends AdbServiceBase {
  static ServiceName = "activity";
  static CommandName = "am";
  #cmd;
  constructor(adb) {
    super(adb);
    this.#cmd = new CmdNoneProtocolService(adb, _ActivityManager.CommandName);
  }
  async startActivity(options) {
    let args = buildArguments([_ActivityManager.ServiceName, "start-activity", "-W"], options, START_ACTIVITY_OPTIONS_MAP);
    args = args.concat(options.intent.build());
    const output = await this.#cmd.spawnWaitText(args).then((output2) => output2.trim());
    for (const line of output) {
      if (line.startsWith("Error:")) {
        throw new Error(line.substring("Error:".length).trim());
      }
      if (line === "Complete") {
        return;
      }
    }
  }
};

// node_modules/@yume-chan/android-bin/esm/bu.js
var AdbBackup = class extends AdbServiceBase {
  /**
   * User must confirm backup on device within 60 seconds.
   */
  async backup(options) {
    const args = ["bu", "backup"];
    if (options.user !== void 0) {
      args.push("--user", options.user.toString());
    }
    args.push(options.saveSharedStorage ? "--shared" : "--no-shared");
    args.push(options.saveWidgets ? "--widgets" : "--no-widgets");
    args.push(options.savePackageApk ? "--apk" : "--no-apk");
    args.push(options.savePackageObb ? "--obb" : "--no-obb");
    args.push(options.savePackageKeyValue ? "--key-value" : "--no-key-value");
    args.push(options.compress ? "--compress" : "--no-compress");
    if (typeof options.packages === "string") {
      switch (options.packages) {
        case "user":
          args.push("--all", "--no-system");
          break;
        case "all":
          args.push("--all", "--system");
          break;
      }
    } else {
      args.push(...options.packages);
    }
    const process = await this.adb.subprocess.noneProtocol.spawn(args);
    return process.output;
  }
  /**
   * User must enter the password (if any) and
   * confirm restore on device within 60 seconds.
   */
  restore(options) {
    const args = ["bu", "restore"];
    if (options.user !== void 0) {
      args.push("--user", options.user.toString());
    }
    return this.adb.subprocess.noneProtocol.spawnWaitText(args);
  }
};

// node_modules/@yume-chan/android-bin/esm/bug-report.js
var BugReport = class _BugReport extends AdbServiceBase {
  static VERSION_REGEX = /(\d+)\.(\d+)/;
  static BEGIN_REGEX = /BEGIN:(.*)/;
  static PROGRESS_REGEX = /PROGRESS:(.*)\/(.*)/;
  static OK_REGEX = /OK:(.*)/;
  static FAIL_REGEX = /FAIL:(.*)/;
  /**
   * Queries the device's bugreport capabilities.
   */
  static async queryCapabilities(adb) {
    if (!adb.subprocess.shellProtocol) {
      return new _BugReport(adb, {
        supportsBugReport: true,
        bugReportZVersion: void 0,
        supportsBugReportZ: false,
        supportsBugReportZProgress: false,
        supportsBugReportZStream: false
      });
    }
    const result = await adb.subprocess.shellProtocol.spawnWaitText([
      "bugreportz",
      "-v"
    ]);
    if (result.exitCode !== 0 || result.stderr === "") {
      return new _BugReport(adb, {
        supportsBugReport: true,
        bugReportZVersion: void 0,
        supportsBugReportZ: false,
        supportsBugReportZProgress: false,
        supportsBugReportZStream: false
      });
    }
    const match = result.stderr.match(_BugReport.VERSION_REGEX);
    if (!match) {
      return new _BugReport(adb, {
        supportsBugReport: true,
        bugReportZVersion: void 0,
        supportsBugReportZ: false,
        supportsBugReportZProgress: false,
        supportsBugReportZStream: false
      });
    }
    const [major, minor] = match[0].split(".").map((x) => parseInt(x, 10));
    return new _BugReport(adb, {
      // Before BugReportZ version 1.2 (Android 12), BugReport was deprecated but still works.
      supportsBugReport: major === 1 && minor <= 1,
      bugReportZVersion: match[0],
      supportsBugReportZ: true,
      supportsBugReportZProgress: major > 1 || minor >= 1,
      supportsBugReportZStream: major > 1 || minor >= 2
    });
  }
  #supportsBugReport;
  /**
   * Gets whether the device supports flat (text file, non-zipped) bugreport.
   *
   * Should be `true` for Android version <= 11.
   */
  get supportsBugReport() {
    return this.#supportsBugReport;
  }
  #bugReportZVersion;
  /**
   * Gets the version of BugReportZ.
   *
   * Will be `undefined` if BugReportZ is not supported.
   */
  get bugReportZVersion() {
    return this.#bugReportZVersion;
  }
  #supportsBugReportZ;
  /**
   * Gets whether the device supports zipped bugreport.
   *
   * Should be `true` for Android version >= 7.
   */
  get supportsBugReportZ() {
    return this.#supportsBugReportZ;
  }
  #supportsBugReportZProgress;
  /**
   * Gets whether the device supports progress report for zipped bugreport.
   *
   * Should be `true` for Android version >= 8.
   */
  get supportsBugReportZProgress() {
    return this.#supportsBugReportZProgress;
  }
  #supportsBugReportZStream;
  /**
   * Gets whether the device supports streaming zipped bugreport.
   *
   * Should be `true` for Android version >= 12.
   */
  get supportsBugReportZStream() {
    return this.#supportsBugReportZStream;
  }
  constructor(adb, capabilities) {
    super(adb);
    this.#supportsBugReport = capabilities.supportsBugReport;
    this.#bugReportZVersion = capabilities.bugReportZVersion;
    this.#supportsBugReportZ = capabilities.supportsBugReportZ;
    this.#supportsBugReportZProgress = capabilities.supportsBugReportZProgress;
    this.#supportsBugReportZStream = capabilities.supportsBugReportZStream;
  }
  /**
   * Creates a legacy, non-zipped bugreport file, or throws an error if `supportsBugReport` is `false`.
   *
   * @returns A flat (text file, non-zipped) bugreport.
   */
  bugReport() {
    if (!this.#supportsBugReport) {
      throw new Error("Flat (text file, non-zipped) bugreport is not supported.");
    }
    return new WrapReadableStream(async () => {
      const process = await this.adb.subprocess.noneProtocol.spawn("bugreport");
      return process.output;
    });
  }
  /**
   * Creates a zipped bugreport file, or throws an error if `supportsBugReportZ` is `false`.
   *
   * Compare to `bugReportZStream`, this method will write the output to a file on device.
   * You can pull it later using sync protocol.
   *
   * @returns The path to the generated bugreport file on device filesystem.
   */
  async bugReportZ(options) {
    if (options?.signal?.aborted) {
      throw options?.signal.reason;
    }
    if (!this.#supportsBugReportZ) {
      throw new Error("bugreportz is not supported");
    }
    const args = ["bugreportz"];
    if (options?.onProgress) {
      if (!this.#supportsBugReportZProgress) {
        throw new Error("bugreportz progress is not supported");
      }
      args.push("-p");
    }
    const process = await this.adb.subprocess.shellProtocol.spawn(args);
    options?.signal?.addEventListener("abort", () => {
      void process.kill();
    });
    let filename;
    let error;
    for await (const line of process.stdout.pipeThrough(new TextDecoderStream()).pipeThrough(new SplitStringStream("\n"))) {
      let match = line.match(_BugReport.PROGRESS_REGEX);
      if (match) {
        options?.onProgress?.(match[1], match[2]);
      }
      match = line.match(_BugReport.BEGIN_REGEX);
      if (match) {
        filename = match[1];
      }
      match = line.match(_BugReport.OK_REGEX);
      if (match) {
        filename = match[1];
      }
      match = line.match(_BugReport.FAIL_REGEX);
      if (match) {
        error = match[1];
      }
    }
    if (error) {
      throw new Error(error);
    }
    if (!filename) {
      throw new Error("bugreportz did not return file name");
    }
    return filename;
  }
  /**
   * Creates a zipped bugreport file, or throws an error if `supportsBugReportZStream` is `false`.
   *
   * @returns The content of the generated bugreport file.
   */
  bugReportZStream() {
    return new PushReadableStream(async (controller) => {
      const process = await this.adb.subprocess.shellProtocol.spawn([
        "bugreportz",
        "-s"
      ]);
      process.stdout.pipeTo(new WritableStream({
        async write(chunk) {
          await controller.enqueue(chunk);
        }
      })).catch((e) => {
        controller.error(e);
      });
      process.stderr.pipeThrough(new TextDecoderStream()).pipeTo(new WritableStream({
        write(chunk) {
          controller.error(new Error(chunk));
        }
      })).catch((e) => {
        controller.error(e);
      });
      await process.exited;
    });
  }
  /**
   * Automatically choose the best bugreport method.
   *
   * * If `supportsBugReportZStream` is `true`, this method will return a stream of zipped bugreport.
   * * If `supportsBugReportZ` is `true`, this method will return a stream of zipped bugreport, and will delete the file on device after the stream is closed.
   * * If `supportsBugReport` is `true`, this method will return a stream of flat bugreport.
   *
   * @param onProgress
   * If `supportsBugReportZStream` is `false` and `supportsBugReportZProgress` is `true`,
   * this callback will be called when progress is updated.
   */
  automatic(onProgress) {
    if (this.#supportsBugReportZStream) {
      return { type: "bugreportz", stream: this.bugReportZStream() };
    }
    if (this.#supportsBugReportZ) {
      let path;
      let sync;
      const controller = new AbortController();
      const cleanup = async () => {
        controller.abort();
        await sync?.dispose();
        if (path) {
          await this.adb.rm(path);
        }
      };
      return {
        type: "bugreportz",
        stream: new WrapReadableStream({
          start: async () => {
            path = await this.bugReportZ({
              signal: controller.signal,
              onProgress: this.#supportsBugReportZProgress ? onProgress : void 0
            });
            sync = await this.adb.sync();
            return sync.read(path);
          },
          cancel: cleanup,
          close: cleanup
        })
      };
    }
    return { type: "bugreport", stream: this.bugReport() };
  }
};

// node_modules/@yume-chan/android-bin/esm/settings.js
var SettingsResetMode = {
  UntrustedDefaults: "untrusted_defaults",
  UntrustedClear: "untrusted_clear",
  TrustedDefaults: "trusted_defaults"
};
var Settings = class _Settings extends AdbServiceBase {
  static ServiceName = "settings";
  static CommandName = "settings";
  #cmd;
  constructor(adb) {
    super(adb);
    this.#cmd = new CmdNoneProtocolService(adb, _Settings.CommandName);
  }
  base(verb, namespace, options, ...args) {
    let command = [_Settings.ServiceName];
    if (options?.user !== void 0) {
      command.push("--user", options.user.toString());
    }
    command.push(verb, namespace);
    command = command.concat(args);
    return this.#cmd.spawnWaitText(command);
  }
  async get(namespace, key, options) {
    const output = await this.base("get", namespace, options, key);
    return output.substring(0, output.length - 1);
  }
  async delete(namespace, key, options) {
    await this.base("delete", namespace, options, key);
  }
  async put(namespace, key, value, options) {
    const args = [key, value];
    if (options?.tag) {
      args.push(options.tag);
    }
    if (options?.makeDefault) {
      args.push("default");
    }
    await this.base("put", namespace, options, ...args);
  }
  async reset(namespace, modeOrPackageName, tagOrOptions, options) {
    const args = [modeOrPackageName];
    if (modeOrPackageName === SettingsResetMode.UntrustedDefaults || modeOrPackageName === SettingsResetMode.UntrustedClear || modeOrPackageName === SettingsResetMode.TrustedDefaults) {
      options = tagOrOptions;
    } else if (typeof tagOrOptions === "string") {
      args.push(tagOrOptions);
    }
    await this.base("reset", namespace, options, ...args);
  }
};

// node_modules/@yume-chan/android-bin/esm/demo-mode.js
var DemoModeSignalStrength;
(function(DemoModeSignalStrength2) {
  DemoModeSignalStrength2["Hidden"] = "null";
  DemoModeSignalStrength2["Level0"] = "0";
  DemoModeSignalStrength2["Level1"] = "1";
  DemoModeSignalStrength2["Level2"] = "2";
  DemoModeSignalStrength2["Level3"] = "3";
  DemoModeSignalStrength2["Level4"] = "4";
})(DemoModeSignalStrength || (DemoModeSignalStrength = {}));
var DemoModeMobileDataTypes = [
  "1x",
  "3g",
  "4g",
  "4g+",
  "5g",
  "5ge",
  "5g+",
  "e",
  "g",
  "h",
  "h+",
  "lte",
  "lte+",
  "dis",
  "not",
  "null"
];
var DemoModeStatusBarModes = [
  "opaque",
  "translucent",
  "semi-transparent",
  "transparent",
  "warning"
];
var DemoMode = class _DemoMode extends AdbServiceBase {
  #settings;
  constructor(adb) {
    super(adb);
    this.#settings = new Settings(adb);
  }
  static ALLOWED_SETTING_KEY = "sysui_demo_allowed";
  // Demo Mode actually doesn't have a setting indicates its enablement
  // However Developer Mode menu uses this key
  // So we can only try our best to guess if it's enabled
  static ENABLED_SETTING_KEY = "sysui_tuner_demo_on";
  async getAllowed() {
    const output = await this.#settings.get("global", _DemoMode.ALLOWED_SETTING_KEY);
    return output === "1";
  }
  async setAllowed(value) {
    if (value) {
      await this.#settings.put("global", _DemoMode.ALLOWED_SETTING_KEY, "1");
    } else {
      await this.setEnabled(false);
      await this.#settings.delete("global", _DemoMode.ALLOWED_SETTING_KEY);
    }
  }
  async getEnabled() {
    const result = await this.#settings.get("global", _DemoMode.ENABLED_SETTING_KEY);
    return result === "1";
  }
  async setEnabled(value) {
    if (value) {
      await this.#settings.put("global", _DemoMode.ENABLED_SETTING_KEY, "1");
    } else {
      await this.#settings.delete("global", _DemoMode.ENABLED_SETTING_KEY);
      await this.broadcast("exit");
    }
  }
  async broadcast(command, extra) {
    await this.adb.subprocess.noneProtocol.spawnWaitText([
      "am",
      "broadcast",
      "-a",
      "com.android.systemui.demo",
      "-e",
      "command",
      command,
      ...extra ? Object.entries(extra).flatMap(([key, value]) => [
        "-e",
        key,
        value
      ]) : []
    ]);
  }
  async setBatteryLevel(level) {
    await this.broadcast("battery", { level: level.toString() });
  }
  async setBatteryCharging(value) {
    await this.broadcast("battery", { plugged: value.toString() });
  }
  async setPowerSaveMode(value) {
    await this.broadcast("battery", { powersave: value.toString() });
  }
  async setAirplaneMode(show) {
    await this.broadcast("network", { airplane: show ? "show" : "hide" });
  }
  async setWifiSignalStrength(value) {
    await this.broadcast("network", { wifi: "show", level: value });
  }
  async setMobileDataType(value) {
    for (let i = 0; i < 2; i += 1) {
      await this.broadcast("network", {
        mobile: "show",
        sims: "1",
        nosim: "hide",
        slot: "0",
        datatype: value,
        fully: "true",
        roam: "false",
        level: "4",
        inflate: "false",
        activity: "in",
        carriernetworkchange: "hide"
      });
    }
  }
  async setMobileSignalStrength(value) {
    await this.broadcast("network", { mobile: "show", level: value });
  }
  async setNoSimCardIcon(show) {
    await this.broadcast("network", { nosim: show ? "show" : "hide" });
  }
  async setStatusBarMode(mode) {
    await this.broadcast("bars", { mode });
  }
  async setVibrateModeEnabled(value) {
    await this.broadcast("status", { volume: value ? "vibrate" : "hide" });
  }
  async setBluetoothConnected(value) {
    await this.broadcast("status", {
      bluetooth: value ? "connected" : "hide"
    });
  }
  async setLocatingIcon(show) {
    await this.broadcast("status", { location: show ? "show" : "hide" });
  }
  async setAlarmIcon(show) {
    await this.broadcast("status", { alarm: show ? "show" : "hide" });
  }
  async setSyncingIcon(show) {
    await this.broadcast("status", { sync: show ? "show" : "hide" });
  }
  async setMuteIcon(show) {
    await this.broadcast("status", { mute: show ? "show" : "hide" });
  }
  async setSpeakerPhoneIcon(show) {
    await this.broadcast("status", {
      speakerphone: show ? "show" : "hide"
    });
  }
  async setNotificationsVisibility(show) {
    await this.broadcast("notifications", { visible: show.toString() });
  }
  async setTime(hour, minute) {
    await this.broadcast("clock", {
      // cspell: disable-next-line
      hhmm: hour.toString().padStart(2, "0") + minute.toString().padStart(2, "0")
    });
  }
};

// node_modules/@yume-chan/android-bin/esm/dumpsys.js
var BatteryDumpFields = {
  "AC powered": { type: "boolean", field: "acPowered" },
  "USB powered": { type: "boolean", field: "usbPowered" },
  "Wireless powered": { type: "boolean", field: "wirelessPowered" },
  "Dock powered": { type: "boolean", field: "dockPowered" },
  "Max charging current": {
    type: "number",
    field: "maxChargingCurrent"
  },
  "Max charging voltage": {
    type: "number",
    field: "maxChargingVoltage"
  },
  "Charge counter": { type: "number", field: "chargeCounter" },
  status: { type: "number", field: "status" },
  health: { type: "number", field: "health" },
  present: { type: "boolean", field: "present" },
  level: { type: "number", field: "level" },
  scale: { type: "number", field: "scale" },
  voltage: { type: "number", field: "voltage" },
  temperature: { type: "number", field: "temperature" },
  technology: { type: "string", field: "technology" },
  current: { type: "number", field: "current" }
};
var Status = {
  Unknown: 1,
  Charging: 2,
  Discharging: 3,
  NotCharging: 4,
  Full: 5
};
var Health = {
  Unknown: 1,
  Good: 2,
  Overheat: 3,
  Dead: 4,
  OverVoltage: 5,
  UnspecifiedFailure: 6,
  Cold: 7
};
var Battery = {
  Status,
  Health
};
var DumpSys = class _DumpSys extends AdbServiceBase {
  static Battery = Battery;
  async diskStats() {
    const result = await this.adb.subprocess.noneProtocol.spawnWaitText([
      "dumpsys",
      "diskstats"
    ]);
    function getSize(name) {
      const match = result.match(new RegExp(`${name}-Free: (\\d+)K / (\\d+)K`));
      if (!match) {
        return [0, 0];
      }
      return [
        Number.parseInt(match[1], 10) * 1024,
        Number.parseInt(match[2], 10) * 1024
      ];
    }
    const [dataFree, dataTotal] = getSize("Data");
    const [cacheFree, cacheTotal] = getSize("Cache");
    const [systemFree, systemTotal] = getSize("System");
    return {
      dataFree,
      dataTotal,
      cacheFree,
      cacheTotal,
      systemFree,
      systemTotal
    };
  }
  async battery() {
    const result = await this.adb.subprocess.noneProtocol.spawnWaitText([
      "dumpsys",
      "battery"
    ]);
    const info = {
      acPowered: false,
      usbPowered: false,
      wirelessPowered: false,
      dockPowered: false,
      status: _DumpSys.Battery.Status.Unknown,
      health: _DumpSys.Battery.Health.Unknown
    };
    for (const line of result.split("\n")) {
      const parts = line.split(":").map((part) => part.trim());
      if (parts.length !== 2) {
        continue;
      }
      const field2 = BatteryDumpFields[parts[0]];
      if (!field2) {
        continue;
      }
      switch (field2.type) {
        case "boolean":
          info[field2.field] = parts[1].trim() === "true";
          break;
        case "number":
          info[field2.field] = Number.parseInt(parts[1].trim(), 10);
          break;
        case "string":
          info[field2.field] = parts[1];
          break;
      }
    }
    return info;
  }
};

// node_modules/@yume-chan/android-bin/esm/intent.js
var IntentBuilder = class {
  #action;
  #categories = [];
  #packageName;
  #component;
  #data;
  #type;
  #stringExtras = /* @__PURE__ */ new Map();
  setAction(action) {
    this.#action = action;
    return this;
  }
  addCategory(category) {
    this.#categories.push(category);
    return this;
  }
  setPackage(packageName) {
    this.#packageName = packageName;
    return this;
  }
  setComponent(component) {
    this.#component = component;
    return this;
  }
  setData(data) {
    this.#data = data;
    return this;
  }
  addStringExtra(key, value) {
    this.#stringExtras.set(key, value);
    return this;
  }
  build() {
    const result = [];
    if (this.#action) {
      result.push("-a", this.#action);
    }
    for (const category of this.#categories) {
      result.push("-c", category);
    }
    if (this.#packageName) {
      result.push("-p", this.#packageName);
    }
    if (this.#component) {
      result.push("-n", this.#component);
    }
    if (this.#data) {
      result.push("-d", this.#data);
    }
    if (this.#type) {
      result.push("-t", this.#type);
    }
    for (const [key, value] of this.#stringExtras) {
      result.push("--es", key, value);
    }
    return result;
  }
};

// node_modules/@yume-chan/android-bin/esm/logcat.js
var LogId = {
  All: -1,
  Main: 0,
  Radio: 1,
  Events: 2,
  System: 3,
  Crash: 4,
  Stats: 5,
  Security: 6,
  Kernel: 7
};
var LogIdName = /* @__PURE__ */ (() => Object.fromEntries(Object.entries(LogId).map(([k, v]) => [v, k])))();
var AndroidLogPriority = {
  Unknown: 0,
  Default: 1,
  Verbose: 2,
  Debug: 3,
  Info: 4,
  Warn: 5,
  Error: 6,
  Fatal: 7,
  Silent: 8
};
var AndroidLogPriorityToCharacter = {
  [AndroidLogPriority.Unknown]: "?",
  [AndroidLogPriority.Default]: "?",
  [AndroidLogPriority.Verbose]: "V",
  [AndroidLogPriority.Debug]: "D",
  [AndroidLogPriority.Info]: "I",
  [AndroidLogPriority.Warn]: "W",
  [AndroidLogPriority.Error]: "E",
  [AndroidLogPriority.Fatal]: "F",
  [AndroidLogPriority.Silent]: "S"
};
var LogcatFormat = {
  Brief: 0,
  Process: 1,
  Tag: 2,
  Thread: 3,
  Raw: 4,
  Time: 5,
  ThreadTime: 6,
  Long: 7
};
function formatTailTime(date) {
  const timestamp = date.getTime();
  return (timestamp / 1e3 | 0) + "." + timestamp % 1e3;
}
var NANOSECONDS_PER_SECOND = /* @__PURE__ */ BigInt(1e9);
var LoggerEntry = struct({
  payloadSize: u16,
  headerSize: u16,
  pid: u32,
  tid: u32,
  seconds: u32,
  nanoseconds: u32,
  logId: u32,
  uid: u32
}, {
  littleEndian: true,
  extra: {
    get timestamp() {
      return BigInt(this.seconds) * NANOSECONDS_PER_SECOND + BigInt(this.nanoseconds);
    }
  }
});
function padZero(number2, length) {
  return number2.toString().padStart(length, "0");
}
function formatSeconds(seconds, modifiers) {
  if (modifiers.monotonic) {
    return padZero(seconds, 6);
  }
  if (modifiers.epoch) {
    return padZero(seconds, 19);
  }
  const date = new Date(seconds * 1e3);
  const month = padZero(date.getMonth() + 1, 2);
  const day = padZero(date.getDate(), 2);
  const hour = padZero(date.getHours(), 2);
  const minute = padZero(date.getMinutes(), 2);
  const second = padZero(date.getSeconds(), 2);
  const result = `${month}-${day} ${hour}:${minute}:${second}`;
  if (modifiers.year) {
    const year = padZero(date.getFullYear(), 4);
    return `${year}-${result}`;
  }
  return result;
}
function formatNanoseconds(nanoseconds, modifiers) {
  if (modifiers.nanoseconds) {
    return padZero(nanoseconds, 9);
  }
  if (modifiers.microseconds) {
    return padZero(nanoseconds / 1e3, 6);
  }
  return padZero(nanoseconds / 1e6, 3);
}
function formatTimezone(seconds, modifiers) {
  if (!modifiers.timezone || modifiers.monotonic || modifiers.epoch) {
    return "";
  }
  const date = new Date(seconds * 1e3);
  const offset = date.getTimezoneOffset();
  const sign = offset <= 0 ? "+" : "-";
  const absolute = Math.abs(offset);
  const hours = absolute / 60 | 0;
  const minutes = absolute % 60;
  return ` ${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
function formatTime(seconds, nanoseconds, modifiers) {
  const secondsString = formatSeconds(seconds, modifiers);
  const nanosecondsString = formatNanoseconds(nanoseconds, modifiers);
  const zoneString = formatTimezone(seconds, modifiers);
  return `${secondsString}.${nanosecondsString}${zoneString}`;
}
function formatUid(uid, modifiers, suffix) {
  return modifiers.uid ? `${uid.toString().padStart(5)}${suffix}` : "";
}
function getFormatPrefix(entry, format, modifiers) {
  switch (format) {
    // TODO: implement other formats
    case LogcatFormat.Tag:
      return `${AndroidLogPriorityToCharacter[entry.priority]}/${entry.tag.padEnd(8)}: `;
    case LogcatFormat.Process:
      return `${AndroidLogPriorityToCharacter[entry.priority]}(${formatUid(entry.uid, modifiers, ":")}${entry.pid.toString().padStart(5)}) `;
    case LogcatFormat.Thread:
      return `${AndroidLogPriorityToCharacter[entry.priority]}(${formatUid(entry.uid, modifiers, ":")}${entry.pid.toString().padStart(5)}:${entry.tid.toString().padStart(5)}) `;
    case LogcatFormat.Raw:
      return "";
    case LogcatFormat.Time:
      return `${formatTime(entry.seconds, entry.nanoseconds, modifiers)} ${AndroidLogPriorityToCharacter[entry.priority]}/${entry.tag.padEnd(8)}(${formatUid(entry.uid, modifiers, ":")}${entry.pid.toString().padStart(5)}): `;
    case LogcatFormat.ThreadTime:
      return `${formatTime(entry.seconds, entry.nanoseconds, modifiers)} ${formatUid(entry.uid, modifiers, " ")}${entry.pid.toString().padStart(5)} ${entry.tid.toString().padStart(5)} ${AndroidLogPriorityToCharacter[entry.priority]} ${entry.tag.toString().padEnd(8)}: `;
    case LogcatFormat.Brief:
    default:
      return `${AndroidLogPriorityToCharacter[entry.priority]}/${entry.tag.padEnd(8)}(${formatUid(entry.uid, modifiers, ":")}${entry.pid.toString().padStart(5)}): `;
  }
}
function getFormatSuffix(entry, format) {
  switch (format) {
    case LogcatFormat.Process:
      return `  (${entry.tag})`;
    default:
      return "";
  }
}
function formatEntryWrapLine(entry, format, modifiers) {
  const prefix = getFormatPrefix(entry, format, modifiers);
  const suffix = getFormatSuffix(entry, format);
  return prefix + entry.message.replaceAll("\n", suffix + "\n" + prefix) + suffix;
}
function AndroidLogEntryToString(format = LogcatFormat.ThreadTime, modifiers = {}) {
  switch (format) {
    case LogcatFormat.Long:
      return `[ ${formatTime(this.seconds, this.nanoseconds, modifiers)} ${formatUid(this.uid, modifiers, ":")}${this.pid.toString().padStart(5)}:${this.tid.toString().padStart(5)} ${AndroidLogPriorityToCharacter[this.priority]}/${this.tag.padEnd(8)} ]
${this.message}
`;
    default:
      return formatEntryWrapLine(this, format, modifiers);
  }
}
function findTagEnd(payload) {
  for (const separator of [0, " ".charCodeAt(0), ":".charCodeAt(0)]) {
    const index2 = payload.indexOf(separator);
    if (index2 !== -1) {
      return index2;
    }
  }
  const index = payload.findIndex((x) => x >= 127);
  if (index !== -1) {
    return index;
  }
  return payload.length;
}
async function deserializeAndroidLogEntry(stream) {
  const entry = await LoggerEntry.deserialize(stream);
  if (entry.headerSize !== LoggerEntry.size) {
    await stream.readExactly(entry.headerSize - LoggerEntry.size);
  }
  let payload = await stream.readExactly(entry.payloadSize);
  entry.priority = payload[0];
  payload = payload.subarray(1);
  const tagEnd = findTagEnd(payload);
  entry.tag = decodeUtf8(payload.subarray(0, tagEnd));
  entry.message = tagEnd < payload.length - 1 ? decodeUtf8(payload.subarray(tagEnd + 1)) : "";
  entry.toString = AndroidLogEntryToString;
  return entry;
}
var Logcat = class _Logcat extends AdbServiceBase {
  static logIdToName(id) {
    return LogIdName[id];
  }
  static logNameToId(name) {
    const key = name[0].toUpperCase() + name.substring(1);
    return LogId[key];
  }
  static joinLogId(ids) {
    return ids.map((id) => _Logcat.logIdToName(id)).join(",");
  }
  static parseSize(value, multiplier) {
    const MULTIPLIERS = ["", "Ki", "Mi", "Gi"];
    return value * 1024 ** (MULTIPLIERS.indexOf(multiplier) || 0);
  }
  // TODO: logcat: Support output format before Android 10
  // ref https://android-review.googlesource.com/c/platform/system/core/+/748128
  static LOG_SIZE_REGEX_10 = /(.*): ring buffer is (.*) (.*)B \((.*) (.*)B consumed\), max entry is (.*) B, max payload is (.*) B/;
  // Android 11 added `readable` part
  // ref https://android-review.googlesource.com/c/platform/system/core/+/1390940
  static LOG_SIZE_REGEX_11 = /(.*): ring buffer is (.*) (.*)B \((.*) (.*)B consumed, (.*) (.*)B readable\), max entry is (.*) B, max payload is (.*) B/;
  async getLogSize(ids) {
    const process = await this.adb.subprocess.noneProtocol.spawn([
      "logcat",
      "-g",
      ...ids ? ["-b", _Logcat.joinLogId(ids)] : []
    ]);
    const result = [];
    for await (const line of process.output.pipeThrough(new TextDecoderStream()).pipeThrough(new SplitStringStream("\n"))) {
      let match = line.match(_Logcat.LOG_SIZE_REGEX_11);
      if (match) {
        result.push({
          id: _Logcat.logNameToId(match[1]),
          size: _Logcat.parseSize(Number.parseInt(match[2], 10), match[3]),
          readable: _Logcat.parseSize(Number.parseInt(match[6], 10), match[7]),
          consumed: _Logcat.parseSize(Number.parseInt(match[4], 10), match[5]),
          maxEntrySize: parseInt(match[8], 10),
          maxPayloadSize: parseInt(match[9], 10)
        });
        break;
      }
      match = line.match(_Logcat.LOG_SIZE_REGEX_10);
      if (match) {
        result.push({
          id: _Logcat.logNameToId(match[1]),
          size: _Logcat.parseSize(Number.parseInt(match[2], 10), match[3]),
          consumed: _Logcat.parseSize(Number.parseInt(match[4], 10), match[5]),
          maxEntrySize: parseInt(match[6], 10),
          maxPayloadSize: parseInt(match[7], 10)
        });
      }
    }
    return result;
  }
  async clear(ids) {
    const args = ["logcat", "-c"];
    if (ids && ids.length > 0) {
      args.push("-b", _Logcat.joinLogId(ids));
    }
    await this.adb.subprocess.noneProtocol.spawnWaitText(args);
  }
  binary(options) {
    return new WrapReadableStream(async () => {
      const args = ["logcat", "-B"];
      if (options?.dump) {
        args.push("-d");
      }
      if (options?.pid) {
        args.push("--pid", options.pid.toString());
      }
      if (options?.ids) {
        args.push("-b", _Logcat.joinLogId(options.ids));
      }
      if (options?.tail) {
        args.push("-t", typeof options.tail === "number" ? options.tail.toString() : formatTailTime(options.tail));
      }
      const process = await this.adb.subprocess.noneProtocol.spawn(args);
      return process.output;
    }).pipeThrough(new BufferedTransformStream((stream) => {
      return deserializeAndroidLogEntry(stream);
    }));
  }
};

// node_modules/@yume-chan/android-bin/esm/string-format.js
var ParseError = class extends Error {
  #expected;
  get expected() {
    return this.#expected;
  }
  constructor(expected) {
    super(`Expected ${expected.join(", ")}`);
    this.#expected = expected;
  }
};
var p = {
  literal: (value) => ({
    parse(reader) {
      if (!reader.value.startsWith(value, reader.position)) {
        throw new ParseError([value.charAt(0)]);
      }
      reader.position += value.length;
      return value;
    },
    stringify() {
      return value;
    }
  }),
  digits: () => ({
    parse(reader) {
      const match = reader.value.substring(reader.position).match(/^\d+/);
      if (!match) {
        throw new ParseError("0123456789".split(""));
      }
      reader.position += match[0].length;
      return Number.parseInt(match[0], 10);
    },
    stringify(value) {
      return value.toString();
    }
  }),
  union: (...args) => ({
    parse(reader) {
      const expected = [];
      for (const format of args) {
        try {
          return format.parse(reader);
        } catch (e) {
          if (e instanceof ParseError) {
            expected.push(...e.expected);
          } else {
            throw e;
          }
        }
      }
      throw new ParseError(expected);
    },
    stringify(value) {
      for (const format of args) {
        try {
          const result = format.stringify(value);
          format.parse({ value: result, position: 0 });
        } catch {
        }
      }
      throw new Error("No format matches");
    }
  }),
  separated: (separator, format, { min = 0, max = Infinity } = {}) => ({
    parse(reader) {
      const result = [];
      while (true) {
        try {
          result.push(format.parse(reader));
          if (result.length === max) {
            break;
          }
        } catch (e) {
          if (result.length < min) {
            throw e;
          } else {
            break;
          }
        }
        if (reader.value.startsWith(separator, reader.position)) {
          reader.position += separator.length;
        } else if (result.length < min) {
          throw new ParseError([separator.charAt(0)]);
        } else {
          break;
        }
      }
      return result;
    },
    stringify(value) {
      return value.map((item) => format.stringify(item)).join(separator);
    }
  }),
  repeated: (format) => ({
    parse(reader) {
      const result = [];
      while (true) {
        try {
          result.push(format.parse(reader));
        } catch {
          break;
        }
      }
      return result;
    },
    stringify(value) {
      return value.map((item) => format.stringify(item)).join("");
    }
  }),
  sequence: (...args) => ({
    parse(reader) {
      const result = {};
      for (const part of args) {
        if ("name" in part) {
          result[part.name] = part.format.parse(reader);
        } else {
          void part.parse(reader);
        }
      }
      return result;
    },
    stringify: (value) => {
      let result = "";
      for (const part of args) {
        if ("name" in part) {
          result += part.format.stringify(value[part.name]);
        }
      }
      return result;
    }
  }),
  map: (format, map, reverse) => ({
    parse(reader) {
      return map(format.parse(reader));
    },
    stringify(value) {
      return format.stringify(reverse(value));
    }
  })
};

// node_modules/@yume-chan/android-bin/esm/overlay-display.js
var OverlayDisplay = class _OverlayDisplay extends AdbServiceBase {
  #settings;
  static SETTING_KEY = "overlay_display_devices";
  static SETTING_FORMAT = p.separated(";", p.sequence({
    name: "modes",
    format: p.separated("|", p.sequence({ name: "width", format: p.digits() }, p.literal("x"), { name: "height", format: p.digits() }, p.literal("/"), { name: "density", format: p.digits() }), { min: 1 })
  }, {
    name: "flags",
    format: p.map(p.repeated(p.sequence(p.literal(","), {
      name: "flag",
      format: p.union(p.literal("secure"), p.literal("own_content_only"), p.literal("show_system_decorations"))
    })), (value) => value.map((item) => item.flag), (value) => value.map((item) => ({ flag: item })))
  }));
  constructor(adb) {
    super(adb);
    this.#settings = new Settings(adb);
  }
  async get() {
    return _OverlayDisplay.SETTING_FORMAT.parse({
      value: await this.#settings.get("global", _OverlayDisplay.SETTING_KEY),
      position: 0
    }).map((device) => ({
      modes: device.modes,
      secure: device.flags.includes("secure"),
      ownContentOnly: device.flags.includes("own_content_only"),
      showSystemDecorations: device.flags.includes("show_system_decorations")
    }));
  }
  async set(devices) {
    await this.#settings.put("global", _OverlayDisplay.SETTING_KEY, _OverlayDisplay.SETTING_FORMAT.stringify(devices.map((device) => {
      const flags = [];
      if (device.secure) {
        flags.push("secure");
      }
      if (device.ownContentOnly) {
        flags.push("own_content_only");
      }
      if (device.showSystemDecorations) {
        flags.push("show_system_decorations");
      }
      return {
        modes: device.modes,
        flags
      };
    })));
  }
};

// node_modules/@yume-chan/android-bin/esm/pm.js
var PackageManagerInstallLocation;
(function(PackageManagerInstallLocation2) {
  PackageManagerInstallLocation2[PackageManagerInstallLocation2["Auto"] = 0] = "Auto";
  PackageManagerInstallLocation2[PackageManagerInstallLocation2["InternalOnly"] = 1] = "InternalOnly";
  PackageManagerInstallLocation2[PackageManagerInstallLocation2["PreferExternal"] = 2] = "PreferExternal";
})(PackageManagerInstallLocation || (PackageManagerInstallLocation = {}));
var PackageManagerInstallReason;
(function(PackageManagerInstallReason2) {
  PackageManagerInstallReason2[PackageManagerInstallReason2["Unknown"] = 0] = "Unknown";
  PackageManagerInstallReason2[PackageManagerInstallReason2["AdminPolicy"] = 1] = "AdminPolicy";
  PackageManagerInstallReason2[PackageManagerInstallReason2["DeviceRestore"] = 2] = "DeviceRestore";
  PackageManagerInstallReason2[PackageManagerInstallReason2["DeviceSetup"] = 3] = "DeviceSetup";
  PackageManagerInstallReason2[PackageManagerInstallReason2["UserRequest"] = 4] = "UserRequest";
})(PackageManagerInstallReason || (PackageManagerInstallReason = {}));
var PACKAGE_MANAGER_INSTALL_OPTIONS_MAP = {
  skipExisting: "-R",
  installerPackageName: "-i",
  allowTest: "-t",
  internalStorage: "-f",
  requestDowngrade: "-d",
  grantRuntimePermissions: "-g",
  restrictPermissions: "--restrict-permissions",
  doNotKill: "--dont-kill",
  originatingUri: "--originating-uri",
  refererUri: "--referrer",
  inheritFrom: "-p",
  packageName: "--pkg",
  abi: "--abi",
  instantApp: "--instant",
  full: "--full",
  preload: "--preload",
  user: "--user",
  installLocation: "--install-location",
  installReason: "--install-reason",
  forceUuid: "--force-uuid",
  apex: "--apex",
  forceNonStaged: "--force-non-staged",
  staged: "--staged",
  forceQueryable: "--force-queryable",
  enableRollback: "--enable-rollback",
  stagedReadyTimeout: "--staged-ready-timeout",
  skipVerification: "--skip-verification",
  bypassLowTargetSdkBlock: "--bypass-low-target-sdk-block"
};
var PACKAGE_MANAGER_LIST_PACKAGES_OPTIONS_MAP = {
  listDisabled: "-d",
  listEnabled: "-e",
  showSourceDir: "-f",
  showInstaller: "-i",
  listSystem: "-s",
  showUid: "-U",
  listThirdParty: "-3",
  showVersionCode: "--show-versioncode",
  listApexOnly: "--apex-only",
  user: "--user",
  uid: "--uid",
  filter: ""
};
var PACKAGE_MANAGER_UNINSTALL_OPTIONS_MAP = {
  keepData: "-k",
  user: "--user",
  versionCode: "--versionCode",
  splitNames: ""
};
var PACKAGE_MANAGER_RESOLVE_ACTIVITY_OPTIONS_MAP = {
  user: "--user"
};
function buildInstallArguments(command, options) {
  const args = buildArguments([PackageManager.ServiceName, command], options, PACKAGE_MANAGER_INSTALL_OPTIONS_MAP);
  if (!options?.skipExisting) {
    args.push("-r");
  }
  return args;
}
var PackageManager = class _PackageManager extends AdbServiceBase {
  static ServiceName = "package";
  static CommandName = "pm";
  #cmd;
  constructor(adb) {
    super(adb);
    this.#cmd = new CmdNoneProtocolService(adb, _PackageManager.CommandName);
  }
  /**
   * Install the apk file.
   *
   * @param apks Path to the apk file. It must exist on the device. On Android 10 and lower, only one apk can be specified.
   */
  async install(apks, options) {
    const args = buildInstallArguments("install", options);
    args[0] = _PackageManager.CommandName;
    args.push(...apks);
    const output = await this.adb.subprocess.noneProtocol.spawnWaitText(args).then((output2) => output2.trim());
    if (output !== "Success") {
      throw new Error(output);
    }
    return output;
  }
  async pushAndInstallStream(stream, options) {
    const fileName = Math.random().toString().substring(2);
    const filePath = `/data/local/tmp/${fileName}.apk`;
    const sync = await this.adb.sync();
    try {
      await sync.write({
        filename: filePath,
        file: stream
      });
    } finally {
      await sync.dispose();
    }
    try {
      return await this.install([filePath], options);
    } finally {
      await this.adb.rm(filePath);
    }
  }
  async installStream(size, stream, options) {
    if (!this.#cmd.isSupported) {
      await this.pushAndInstallStream(stream, options);
      return;
    }
    const args = buildInstallArguments("install", options);
    args.push("-S", size.toString());
    const process = await this.#cmd.spawn(args);
    const output = process.output.pipeThrough(new TextDecoderStream()).pipeThrough(new ConcatStringStream()).then((output2) => output2.trim());
    await Promise.all([
      stream.pipeTo(process.stdin),
      output.then((output2) => {
        if (output2 !== "Success") {
          throw new Error(output2);
        }
      })
    ]);
  }
  static parsePackageListItem(line) {
    line = line.substring("package:".length);
    let packageName;
    let sourceDir;
    let versionCode;
    let installer;
    let uid;
    let index = line.indexOf(" uid:");
    if (index !== -1) {
      uid = Number.parseInt(line.substring(index + " uid:".length), 10);
      line = line.substring(0, index);
    }
    index = line.indexOf(" installer=");
    if (index !== -1) {
      installer = line.substring(index + " installer=".length);
      line = line.substring(0, index);
    }
    index = line.indexOf(" versionCode:");
    if (index !== -1) {
      versionCode = Number.parseInt(line.substring(index + " versionCode:".length), 10);
      line = line.substring(0, index);
    }
    index = line.lastIndexOf("=");
    if (index !== -1) {
      sourceDir = line.substring(0, index);
      packageName = line.substring(index + "=".length);
    } else {
      packageName = line;
    }
    return {
      packageName,
      sourceDir,
      versionCode,
      installer,
      uid
    };
  }
  async *listPackages(options) {
    const args = buildArguments(["package", "list", "packages"], options, PACKAGE_MANAGER_LIST_PACKAGES_OPTIONS_MAP);
    if (options?.filter) {
      args.push(options.filter);
    }
    const process = await this.#cmd.spawn(args);
    const reader = process.output.pipeThrough(new TextDecoderStream()).pipeThrough(new SplitStringStream("\n")).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield _PackageManager.parsePackageListItem(value);
    }
  }
  async getPackageSources(packageName) {
    const args = [_PackageManager.ServiceName, "-p", packageName];
    const process = await this.#cmd.spawn(args);
    const result = [];
    for await (const line of process.output.pipeThrough(new TextDecoderStream()).pipeThrough(new SplitStringStream("\n"))) {
      if (line.startsWith("package:")) {
        result.push(line.substring("package:".length));
      }
    }
    return result;
  }
  async uninstall(packageName, options) {
    const args = buildArguments([_PackageManager.ServiceName, "uninstall"], options, PACKAGE_MANAGER_UNINSTALL_OPTIONS_MAP);
    args.push(packageName);
    if (options?.splitNames) {
      args.push(...options.splitNames);
    }
    const output = await this.#cmd.spawnWaitText(args).then((output2) => output2.trim());
    if (output !== "Success") {
      throw new Error(output);
    }
  }
  async resolveActivity(options) {
    let args = buildArguments([_PackageManager.ServiceName, "resolve-activity", "--components"], options, PACKAGE_MANAGER_RESOLVE_ACTIVITY_OPTIONS_MAP);
    args = args.concat(options.intent.build());
    const output = await this.#cmd.spawnWaitText(args).then((output2) => output2.trim());
    if (output === "No activity found") {
      return void 0;
    }
    return output;
  }
  /**
   * Creates a new install session.
   *
   * Install sessions are used to install apps with multiple splits, but it can also be used to install a single apk.
   *
   * Install sessions was added in Android 5.0 (API level 21).
   *
   * @param options Options for the install session
   * @returns ID of the new install session
   */
  async sessionCreate(options) {
    const args = buildInstallArguments("install-create", options);
    const output = await this.#cmd.spawnWaitText(args).then((output2) => output2.trim());
    const sessionIdString = output.match(/.*\[(\d+)\].*/);
    if (!sessionIdString) {
      throw new Error("Failed to create install session");
    }
    return Number.parseInt(sessionIdString[1], 10);
  }
  async checkResult(stream) {
    const output = await stream.pipeThrough(new TextDecoderStream()).pipeThrough(new ConcatStringStream()).then((output2) => output2.trim());
    if (!output.startsWith("Success")) {
      throw new Error(output);
    }
  }
  async sessionAddSplit(sessionId, splitName, path) {
    const args = [
      "pm",
      "install-write",
      sessionId.toString(),
      splitName,
      path
    ];
    const process = await this.adb.subprocess.noneProtocol.spawn(args);
    await this.checkResult(process.output);
  }
  async sessionAddSplitStream(sessionId, splitName, size, stream) {
    const args = [
      _PackageManager.ServiceName,
      "install-write",
      "-S",
      size.toString(),
      sessionId.toString(),
      splitName,
      "-"
    ];
    const process = await this.#cmd.spawn(args);
    await Promise.all([
      stream.pipeTo(process.stdin),
      this.checkResult(process.output)
    ]);
  }
  async sessionCommit(sessionId) {
    const args = [
      _PackageManager.ServiceName,
      "install-commit",
      sessionId.toString()
    ];
    const process = await this.#cmd.spawn(args);
    await this.checkResult(process.output);
  }
  async sessionAbandon(sessionId) {
    const args = [
      _PackageManager.ServiceName,
      "install-abandon",
      sessionId.toString()
    ];
    const process = await this.#cmd.spawn(args);
    await this.checkResult(process.output);
  }
};
var PackageManagerInstallSession = class _PackageManagerInstallSession {
  static async create(packageManager, options) {
    const id = await packageManager.sessionCreate(options);
    return new _PackageManagerInstallSession(packageManager, id);
  }
  #packageManager;
  #id;
  get id() {
    return this.#id;
  }
  constructor(packageManager, id) {
    this.#packageManager = packageManager;
    this.#id = id;
  }
  addSplit(splitName, path) {
    return this.#packageManager.sessionAddSplit(this.#id, splitName, path);
  }
  addSplitStream(splitName, size, stream) {
    return this.#packageManager.sessionAddSplitStream(this.#id, splitName, size, stream);
  }
  commit() {
    return this.#packageManager.sessionCommit(this.#id);
  }
  abandon() {
    return this.#packageManager.sessionAbandon(this.#id);
  }
};

// node_modules/@yume-chan/scrcpy/esm/index.js
var esm_exports5 = {};
__export(esm_exports5, {
  AndroidAv1Level: () => AndroidAv1Level,
  AndroidAv1Profile: () => AndroidAv1Profile,
  AndroidAvcLevel: () => AndroidAvcLevel,
  AndroidAvcProfile: () => AndroidAvcProfile,
  AndroidHevcLevel: () => AndroidHevcLevel,
  AndroidHevcProfile: () => AndroidHevcProfile,
  AndroidKeyCode: () => AndroidKeyCode,
  AndroidKeyEventAction: () => AndroidKeyEventAction,
  AndroidKeyEventMeta: () => AndroidKeyEventMeta,
  AndroidKeyNames: () => AndroidKeyNames,
  AndroidMotionEventAction: () => AndroidMotionEventAction,
  AndroidMotionEventButton: () => AndroidMotionEventButton,
  AndroidScreenPowerMode: () => AndroidScreenPowerMode,
  Av1: () => Av1,
  DefaultServerPath: () => DefaultServerPath,
  EmptyControlMessage: () => EmptyControlMessage,
  H265AspectRatioIndicator: () => H265AspectRatioIndicator,
  NaluSodbBitReader: () => NaluSodbBitReader,
  ScrcpyAudioCodec: () => ScrcpyAudioCodec,
  ScrcpyBackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ScrcpyCaptureOrientation: () => CaptureOrientation,
  ScrcpyCodecOptions: () => CodecOptions,
  ScrcpyControlMessageSerializer: () => ScrcpyControlMessageSerializer,
  ScrcpyControlMessageType: () => ScrcpyControlMessageType,
  ScrcpyControlMessageTypeMap: () => ScrcpyControlMessageTypeMap,
  ScrcpyControlMessageWriter: () => ScrcpyControlMessageWriter,
  ScrcpyCrop: () => Crop,
  ScrcpyDeviceMessageParsers: () => ScrcpyDeviceMessageParsers,
  ScrcpyInjectKeyCodeControlMessage: () => ScrcpyInjectKeyCodeControlMessage,
  ScrcpyInjectScrollControlMessage: () => InjectScrollControlMessage3,
  ScrcpyInjectTextControlMessage: () => ScrcpyInjectTextControlMessage,
  ScrcpyInjectTouchControlMessage: () => InjectTouchControlMessage2,
  ScrcpyInstanceId: () => InstanceId,
  ScrcpyLockOrientation: () => LockOrientation,
  ScrcpyNewDisplay: () => NewDisplay,
  ScrcpyOptions1_15: () => ScrcpyOptions1_15,
  ScrcpyOptions1_15_1: () => ScrcpyOptions1_15_1,
  ScrcpyOptions1_16: () => ScrcpyOptions1_16,
  ScrcpyOptions1_17: () => ScrcpyOptions1_17,
  ScrcpyOptions1_18: () => ScrcpyOptions1_18,
  ScrcpyOptions1_19: () => ScrcpyOptions1_19,
  ScrcpyOptions1_20: () => ScrcpyOptions1_20,
  ScrcpyOptions1_21: () => ScrcpyOptions1_21,
  ScrcpyOptions1_22: () => ScrcpyOptions1_22,
  ScrcpyOptions1_23: () => ScrcpyOptions1_23,
  ScrcpyOptions1_24: () => ScrcpyOptions1_24,
  ScrcpyOptions1_25: () => ScrcpyOptions1_25,
  ScrcpyOptions2_0: () => ScrcpyOptions2_0,
  ScrcpyOptions2_1: () => ScrcpyOptions2_1,
  ScrcpyOptions2_1_1: () => ScrcpyOptions2_1_1,
  ScrcpyOptions2_2: () => ScrcpyOptions2_2,
  ScrcpyOptions2_3: () => ScrcpyOptions2_3,
  ScrcpyOptions2_3_1: () => ScrcpyOptions2_3_1,
  ScrcpyOptions2_4: () => ScrcpyOptions2_4,
  ScrcpyOptions2_5: () => ScrcpyOptions2_5,
  ScrcpyOptions2_6: () => ScrcpyOptions2_6,
  ScrcpyOptions2_6_1: () => ScrcpyOptions2_6_1,
  ScrcpyOptions2_7: () => ScrcpyOptions2_7,
  ScrcpyOptions3_0: () => ScrcpyOptions3_0,
  ScrcpyOptions3_0_1: () => ScrcpyOptions3_0_1,
  ScrcpyOptions3_0_2: () => ScrcpyOptions3_0_2,
  ScrcpyOptions3_1: () => ScrcpyOptions3_1,
  ScrcpyOptions3_2: () => ScrcpyOptions3_2,
  ScrcpyOptions3_3: () => ScrcpyOptions3_3,
  ScrcpyOptions3_3_1: () => ScrcpyOptions3_3_1,
  ScrcpyOptions3_3_2: () => ScrcpyOptions3_3_2,
  ScrcpyOptions3_3_3: () => ScrcpyOptions3_3_1,
  ScrcpyOptionsLatest: () => ScrcpyOptions3_3_1,
  ScrcpyOrientation: () => Orientation,
  ScrcpyPointerId: () => PointerId,
  ScrcpySetClipboardControlMessage: () => SetClipboardControlMessage2,
  ScrcpySetDisplayPowerControlMessage: () => ScrcpySetDisplayPowerControlMessage,
  ScrcpyUHidCreateControlMessage: () => UHidCreateControlMessage3,
  ScrcpyUHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  ScrcpyVideoCodecId: () => ScrcpyVideoCodecId,
  ScrcpyVideoCodecNameMap: () => ScrcpyVideoCodecNameMap,
  annexBSplitNalu: () => annexBSplitNalu,
  clamp: () => clamp,
  getSubHeightC: () => getSubHeightC,
  getSubWidthC: () => getSubWidthC,
  h264ParseConfiguration: () => h264ParseConfiguration,
  h264ParseSequenceParameterSet: () => h264ParseSequenceParameterSet,
  h264SearchConfiguration: () => h264SearchConfiguration,
  h265ParseConfiguration: () => h265ParseConfiguration,
  h265ParseHrdParameters: () => h265ParseHrdParameters,
  h265ParseNaluHeader: () => h265ParseNaluHeader,
  h265ParseScalingListData: () => h265ParseScalingListData,
  h265ParseSequenceParameterSet: () => h265ParseSequenceParameterSet,
  h265ParseShortTermReferencePictureSet: () => h265ParseShortTermReferencePictureSet,
  h265ParseSps3dExtension: () => h265ParseSps3dExtension,
  h265ParseSpsMultilayerExtension: () => h265ParseSpsMultilayerExtension,
  h265ParseSubLayerHrdParameters: () => h265ParseSubLayerHrdParameters,
  h265ParseVideoParameterSet: () => h265ParseVideoParameterSet,
  h265ParseVuiParameters: () => h265ParseVuiParameters,
  h265SearchConfiguration: () => h265SearchConfiguration,
  isScrcpyOptionValue: () => isScrcpyOptionValue,
  omit: () => omit,
  toScrcpyOptionValue: () => toScrcpyOptionValue
});

// node_modules/@yume-chan/scrcpy/esm/base/audio.js
var ScrcpyAudioCodec = class _ScrcpyAudioCodec {
  static Opus = /* @__PURE__ */ new _ScrcpyAudioCodec("opus", 1869641075, "audio/opus", "opus");
  static Aac = /* @__PURE__ */ new _ScrcpyAudioCodec("aac", 6381923, "audio/aac", "mp4a.66");
  static Flac = /* @__PURE__ */ new _ScrcpyAudioCodec("flac", 1718378851, "audio/flac", "flac");
  static Raw = /* @__PURE__ */ new _ScrcpyAudioCodec("raw", 7496055, "audio/raw", "");
  optionValue;
  metadataValue;
  mimeType;
  webCodecId;
  constructor(optionValue, metadataValue, mimeType, webCodecId) {
    this.optionValue = optionValue;
    this.metadataValue = metadataValue;
    this.mimeType = mimeType;
    this.webCodecId = webCodecId;
  }
  toOptionValue() {
    return this.optionValue;
  }
};

// node_modules/@yume-chan/scrcpy/esm/base/control-message-type.js
var ScrcpyControlMessageType = {
  InjectKeyCode: 0,
  InjectText: 1,
  InjectTouch: 2,
  InjectScroll: 3,
  BackOrScreenOn: 4,
  ExpandNotificationPanel: 5,
  ExpandSettingPanel: 6,
  CollapseNotificationPanel: 7,
  GetClipboard: 8,
  SetClipboard: 9,
  SetDisplayPower: 10,
  RotateDevice: 11,
  UHidCreate: 12,
  UHidInput: 13,
  UHidDestroy: 14,
  OpenHardKeyboardSettings: 15,
  StartApp: 16,
  ResetVideo: 17
};

// node_modules/@yume-chan/scrcpy/esm/base/device-message.js
var ScrcpyDeviceMessageParsers = class {
  #parsers = [];
  get parsers() {
    return this.#parsers;
  }
  #add(id, parser) {
    if (this.#parsers[id]) {
      throw new Error(`Duplicate parser for id ${id}`);
    }
    this.#parsers[id] = parser;
  }
  add(parser) {
    if (Array.isArray(parser.id)) {
      for (const id of parser.id) {
        this.#add(id, parser);
      }
    } else {
      this.#add(parser.id, parser);
    }
    return parser;
  }
  async parse(id, stream) {
    const parser = this.#parsers[id];
    if (!parser) {
      throw new Error(`Unknown device message id ${id}`);
    }
    return parser.parse(id, stream);
  }
  close() {
    for (const parser of this.#parsers) {
      parser.close();
    }
  }
  error(e) {
    for (const parser of this.#parsers) {
      parser.error(e);
    }
  }
};

// node_modules/@yume-chan/scrcpy/esm/base/option-value.js
function isScrcpyOptionValue(value) {
  return typeof value === "object" && value !== null && "toOptionValue" in value && typeof value.toOptionValue === "function";
}
function toScrcpyOptionValue(value, empty) {
  if (isScrcpyOptionValue(value)) {
    value = value.toOptionValue();
  }
  if (value === void 0) {
    return empty;
  }
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
    throw new TypeError(`Invalid option value: ${JSON.stringify(value)}`);
  }
  return value.toString();
}

// node_modules/@yume-chan/scrcpy/esm/base/video.js
var ScrcpyVideoCodecId = {
  H264: 1748121140,
  H265: 1748121141,
  AV1: 6387249
};
var ScrcpyVideoCodecNameMap = /* @__PURE__ */ (() => {
  const result = /* @__PURE__ */ new Map();
  for (const key in ScrcpyVideoCodecId) {
    const value = ScrcpyVideoCodecId[key];
    result.set(value, key);
  }
  return result;
})();

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/index.js
var impl_exports = {};
__export(impl_exports, {
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes,
  Crop: () => Crop,
  Defaults: () => Defaults,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder,
  SetClipboardControlMessage: () => SetClipboardControlMessage,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays
});

// node_modules/@yume-chan/scrcpy/esm/android/key-event.js
var AndroidKeyEventAction = {
  Down: 0,
  Up: 1
};
var AndroidKeyEventMeta = {
  None: 0,
  Alt: 2,
  AltLeft: 16,
  AltRight: 32,
  Shift: 1,
  ShiftLeft: 64,
  ShiftRight: 128,
  Ctrl: 4096,
  CtrlLeft: 8192,
  CtrlRight: 16384,
  Meta: 65536,
  MetaLeft: 131072,
  MetaRight: 262144,
  CapsLock: 1048576,
  NumLock: 2097152,
  ScrollLock: 4194304
};
var AndroidKeyCode = {
  AndroidHome: 3,
  AndroidBack: 4,
  AndroidCall: 5,
  AndroidEndCall: 6,
  Digit0: 7,
  Digit1: 8,
  Digit2: 9,
  Digit3: 10,
  Digit4: 11,
  Digit5: 12,
  Digit6: 13,
  Digit7: 14,
  Digit8: 15,
  Digit9: 16,
  /**
   * '*' key.
   */
  Star: 17,
  // Name not verified
  /**
   * '#' key.
   */
  Pound: 18,
  // Name not verified
  /**
   * Directional Pad Up key.
   */
  ArrowUp: 19,
  /**
   * Directional Pad Down key.
   */
  ArrowDown: 20,
  /**
   * Directional Pad Left key.
   */
  ArrowLeft: 21,
  /**
   * Directional Pad Right key.
   */
  ArrowRight: 22,
  /**
   * Directional Pad Center key.
   */
  AndroidDPadCenter: 23,
  VolumeUp: 24,
  // Name not verified
  VolumeDown: 25,
  // Name not verified
  Power: 26,
  // Name not verified
  AndroidCamera: 27,
  Clear: 28,
  // Name not verified
  KeyA: 29,
  KeyB: 30,
  KeyC: 31,
  KeyD: 32,
  KeyE: 33,
  KeyF: 34,
  KeyG: 35,
  KeyH: 36,
  KeyI: 37,
  KeyJ: 38,
  KeyK: 39,
  KeyL: 40,
  KeyM: 41,
  KeyN: 42,
  KeyO: 43,
  KeyP: 44,
  KeyQ: 45,
  KeyR: 46,
  KeyS: 47,
  KeyT: 48,
  KeyU: 49,
  KeyV: 50,
  KeyW: 51,
  KeyX: 52,
  KeyY: 53,
  KeyZ: 54,
  Comma: 55,
  Period: 56,
  AltLeft: 57,
  AltRight: 58,
  ShiftLeft: 59,
  ShiftRight: 60,
  Tab: 61,
  Space: 62,
  AndroidSymbol: 63,
  AndroidExplorer: 64,
  AndroidEnvelope: 65,
  Enter: 66,
  Backspace: 67,
  Backquote: 68,
  Minus: 69,
  Equal: 70,
  BracketLeft: 71,
  BracketRight: 72,
  Backslash: 73,
  Semicolon: 74,
  Quote: 75,
  Slash: 76,
  At: 77,
  // Name not verified
  AndroidNum: 78,
  AndroidHeadsetHook: 79,
  /**
   * Camera Focus key。
   */
  AndroidFocus: 80,
  Plus: 81,
  // Name not verified
  ContextMenu: 82,
  AndroidNotification: 83,
  AndroidSearch: 84,
  PageUp: 92,
  PageDown: 93,
  Escape: 111,
  Delete: 112,
  ControlLeft: 113,
  ControlRight: 114,
  CapsLock: 115,
  ScrollLock: 116,
  MetaLeft: 117,
  MetaRight: 118,
  AndroidFunction: 119,
  PrintScreen: 120,
  Pause: 121,
  Home: 122,
  End: 123,
  Insert: 124,
  AndroidForward: 125,
  F1: 131,
  F2: 132,
  F3: 133,
  F4: 134,
  F5: 135,
  F6: 136,
  F7: 137,
  F8: 138,
  F9: 139,
  F10: 140,
  F11: 141,
  F12: 142,
  NumLock: 143,
  Numpad0: 144,
  Numpad1: 145,
  Numpad2: 146,
  Numpad3: 147,
  Numpad4: 148,
  Numpad5: 149,
  Numpad6: 150,
  Numpad7: 151,
  Numpad8: 152,
  Numpad9: 153,
  NumpadDivide: 154,
  NumpadMultiply: 155,
  NumpadSubtract: 156,
  NumpadAdd: 157,
  NumpadDecimal: 158,
  NumpadComma: 159,
  // Name not verified
  NumpadEnter: 160,
  NumpadEquals: 161,
  // Name not verified
  NumpadLeftParen: 162,
  // Name not verified
  NumpadRightParen: 163,
  // Name not verified
  VolumeMute: 164,
  // Name not verified
  AndroidAppSwitch: 187,
  // Name not verified
  AndroidCut: 277,
  AndroidCopy: 278,
  AndroidPaste: 279
};
var AndroidKeyNames = /* @__PURE__ */ (() => Object.fromEntries(Object.entries(AndroidKeyCode).map(([k, v]) => [v, k])))();

// node_modules/@yume-chan/scrcpy/esm/android/motion-event.js
var AndroidMotionEventAction = {
  Down: 0,
  Up: 1,
  Move: 2,
  Cancel: 3,
  Outside: 4,
  PointerDown: 5,
  PointerUp: 6,
  HoverMove: 7,
  Scroll: 8,
  HoverEnter: 9,
  HoverExit: 10,
  ButtonPress: 11,
  ButtonRelease: 12
};
var AndroidMotionEventButton = {
  None: 0,
  Primary: 1,
  Secondary: 2,
  Tertiary: 4,
  Back: 8,
  Forward: 16,
  StylusPrimary: 32,
  StylusSecondary: 64
};

// node_modules/@yume-chan/scrcpy/esm/android/screen-power-mode.js
var AndroidScreenPowerMode = {
  Off: 0,
  Normal: 2
};

// node_modules/@yume-chan/scrcpy/esm/control/empty.js
var EmptyControlMessage = struct({ type: u8 }, { littleEndian: false });

// node_modules/@yume-chan/scrcpy/esm/control/inject-key-code.js
var ScrcpyInjectKeyCodeControlMessage = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.InjectKeyCode),
  action: u8(),
  keyCode: u32(),
  repeat: u32,
  metaState: u32()
}, { littleEndian: false }))();

// node_modules/@yume-chan/scrcpy/esm/control/inject-text.js
var ScrcpyInjectTextControlMessage = struct({ type: u8, text: string(u32) }, { littleEndian: false });

// node_modules/@yume-chan/scrcpy/esm/control/message-type-map.js
var ScrcpyControlMessageTypeMap = class {
  #types;
  constructor(options) {
    this.#types = options.controlMessageTypes;
  }
  get(type) {
    const value = this.#types.indexOf(type);
    if (value === -1) {
      throw new TypeError("Invalid or unsupported control message type");
    }
    return value;
  }
  fillMessageType(message, type) {
    message.type = this.get(type);
    return message;
  }
};

// node_modules/@yume-chan/scrcpy/esm/control/set-screen-power-mode.js
var ScrcpySetDisplayPowerControlMessage = struct({ type: u8, mode: u8() }, { littleEndian: false });

// node_modules/@yume-chan/scrcpy/esm/control/start-app.js
var ScrcpyStartAppControlMessage = struct({
  type: u8,
  name: string(u8)
}, { littleEndian: false });

// node_modules/@yume-chan/scrcpy/esm/control/uhid.js
var ScrcpyUHidInputControlMessage = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.UHidInput),
  id: u16,
  data: buffer(u16)
}, { littleEndian: false }))();
var ScrcpyUHidDestroyControlMessage = struct({ type: u8, id: u16 }, { littleEndian: false });

// node_modules/@yume-chan/scrcpy/esm/control/serializer.js
var ScrcpyControlMessageSerializer = class {
  #options;
  #typeMap;
  #scrollController;
  constructor(options) {
    this.#options = options;
    this.#typeMap = new ScrcpyControlMessageTypeMap(options);
    this.#scrollController = options.createScrollController();
  }
  injectKeyCode(message) {
    return ScrcpyInjectKeyCodeControlMessage.serialize(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.InjectKeyCode));
  }
  injectText(text) {
    return ScrcpyInjectTextControlMessage.serialize({
      text,
      type: this.#typeMap.get(ScrcpyControlMessageType.InjectText)
    });
  }
  /**
   * `pressure` is a float value between 0 and 1.
   */
  injectTouch(message) {
    return this.#options.serializeInjectTouchControlMessage(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.InjectTouch));
  }
  /**
   * `scrollX` and `scrollY` are float values between 0 and 1.
   */
  injectScroll(message) {
    return this.#scrollController.serializeScrollMessage(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.InjectScroll));
  }
  backOrScreenOn(action) {
    return this.#options.serializeBackOrScreenOnControlMessage({
      action,
      type: this.#typeMap.get(ScrcpyControlMessageType.BackOrScreenOn)
    });
  }
  setDisplayPower(mode) {
    return ScrcpySetDisplayPowerControlMessage.serialize({
      mode,
      type: this.#typeMap.get(ScrcpyControlMessageType.SetDisplayPower)
    });
  }
  expandNotificationPanel() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.ExpandNotificationPanel)
    });
  }
  expandSettingPanel() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.ExpandSettingPanel)
    });
  }
  collapseNotificationPanel() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.CollapseNotificationPanel)
    });
  }
  rotateDevice() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.RotateDevice)
    });
  }
  setClipboard(message) {
    return this.#options.serializeSetClipboardControlMessage({
      ...message,
      type: this.#typeMap.get(ScrcpyControlMessageType.SetClipboard)
    });
  }
  uHidCreate(message) {
    if (!this.#options.serializeUHidCreateControlMessage) {
      throw new Error("UHid not supported");
    }
    return this.#options.serializeUHidCreateControlMessage(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.UHidCreate));
  }
  uHidInput(message) {
    return ScrcpyUHidInputControlMessage.serialize(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.UHidInput));
  }
  uHidDestroy(id) {
    return ScrcpyUHidDestroyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.UHidDestroy),
      id
    });
  }
  startApp(name, options) {
    if (options?.searchByName) {
      name = "?" + name;
    }
    if (options?.forceStop) {
      name = "+" + name;
    }
    return ScrcpyStartAppControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.StartApp),
      name
    });
  }
  resetVideo() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.ResetVideo)
    });
  }
};

// node_modules/@yume-chan/scrcpy/esm/control/writer.js
var ScrcpyControlMessageWriter = class {
  #writer;
  #serializer;
  constructor(writer, options) {
    this.#writer = writer;
    this.#serializer = new ScrcpyControlMessageSerializer(options);
  }
  write(message) {
    return Consumable.WritableStream.write(this.#writer, message);
  }
  injectKeyCode(message) {
    return this.write(this.#serializer.injectKeyCode(message));
  }
  injectText(text) {
    return this.write(this.#serializer.injectText(text));
  }
  /**
   * `pressure` is a float value between 0 and 1.
   */
  injectTouch(message) {
    return this.write(this.#serializer.injectTouch(message));
  }
  /**
   * `scrollX` and `scrollY` are float values between 0 and 1.
   */
  async injectScroll(message) {
    const data = this.#serializer.injectScroll(message);
    if (data) {
      await this.write(data);
    }
  }
  async backOrScreenOn(action) {
    const data = this.#serializer.backOrScreenOn(action);
    if (data) {
      await this.write(data);
    }
  }
  setScreenPowerMode(mode) {
    return this.write(this.#serializer.setDisplayPower(mode));
  }
  expandNotificationPanel() {
    return this.write(this.#serializer.expandNotificationPanel());
  }
  expandSettingPanel() {
    return this.write(this.#serializer.expandSettingPanel());
  }
  collapseNotificationPanel() {
    return this.write(this.#serializer.collapseNotificationPanel());
  }
  rotateDevice() {
    return this.write(this.#serializer.rotateDevice());
  }
  async setClipboard(message) {
    const result = this.#serializer.setClipboard(message);
    if (result instanceof Uint8Array) {
      await this.write(result);
    } else {
      await this.write(result[0]);
      await result[1];
    }
  }
  uHidCreate(message) {
    return this.write(this.#serializer.uHidCreate(message));
  }
  uHidInput(message) {
    return this.write(this.#serializer.uHidInput(message));
  }
  uHidDestroy(id) {
    return this.write(this.#serializer.uHidDestroy(id));
  }
  startApp(name, options) {
    return this.write(this.#serializer.startApp(name, options));
  }
  resetVideo() {
    return this.write(this.#serializer.resetVideo());
  }
  releaseLock() {
    this.#writer.releaseLock();
  }
  async close() {
    await this.#writer.close();
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/back-or-screen-on.js
var BackOrScreenOnControlMessage = EmptyControlMessage;
function serializeBackOrScreenOnControlMessage(message) {
  if (message.action === AndroidKeyEventAction.Down) {
    return BackOrScreenOnControlMessage.serialize(message);
  }
  return void 0;
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/clipboard-stream.js
var ClipboardDeviceMessage = struct({ content: string(u32) }, { littleEndian: false });
var ClipboardStream = class extends PushReadableStream {
  #controller;
  id = 0;
  constructor() {
    let controller;
    super((controller_) => {
      controller = controller_;
    });
    this.#controller = controller;
  }
  async parse(_id, stream) {
    const message = await ClipboardDeviceMessage.deserialize(stream);
    await this.#controller.enqueue(message.content);
  }
  close() {
    this.#controller.close();
  }
  error(e) {
    this.#controller.error(e);
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/control-message-types.js
var ControlMessageTypes = /* @__PURE__ */ (() => [
  /*  0 */
  ScrcpyControlMessageType.InjectKeyCode,
  /*  1 */
  ScrcpyControlMessageType.InjectText,
  /*  2 */
  ScrcpyControlMessageType.InjectTouch,
  /*  3 */
  ScrcpyControlMessageType.InjectScroll,
  /*  4 */
  ScrcpyControlMessageType.BackOrScreenOn,
  /*  5 */
  ScrcpyControlMessageType.ExpandNotificationPanel,
  /*  6 */
  ScrcpyControlMessageType.CollapseNotificationPanel,
  /*  7 */
  ScrcpyControlMessageType.GetClipboard,
  /*  8 */
  ScrcpyControlMessageType.SetClipboard,
  /*  9 */
  ScrcpyControlMessageType.SetDisplayPower,
  /* 10 */
  ScrcpyControlMessageType.RotateDevice
])();

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/init.js
var VideoOrientation = {
  Unlocked: -1,
  Portrait: 0,
  Landscape: 1,
  PortraitFlipped: 2,
  LandscapeFlipped: 3
};
function toDashCase(input) {
  return input.replace(/([A-Z])/g, "-$1").toLowerCase();
}
var CodecOptionTypes = {
  repeatPreviousFrameAfter: "long",
  maxPtsGapToEncoder: "long"
};
var CodecOptions = class _CodecOptions {
  static Empty = /* @__PURE__ */ new _CodecOptions();
  options;
  constructor(options = {}) {
    for (const [key, value] of Object.entries(options)) {
      if (value === void 0) {
        continue;
      }
      if (typeof value !== "number") {
        throw new Error(`Invalid option value for ${key}: ${String(value)}`);
      }
    }
    this.options = options;
  }
  toOptionValue() {
    const entries = Object.entries(this.options).filter(([, value]) => value !== void 0);
    if (entries.length === 0) {
      return void 0;
    }
    return entries.map(([key, value]) => {
      let result = toDashCase(key);
      const type = CodecOptionTypes[key];
      if (type) {
        result += `:${type}`;
      }
      result += `=${value}`;
      return result;
    }).join(",");
  }
};
var Crop = class {
  width;
  height;
  x;
  y;
  constructor(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
  }
  toOptionValue() {
    return `${this.width}:${this.height}:${this.x}:${this.y}`;
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/defaults.js
var Defaults = {
  logLevel: "debug",
  maxSize: 0,
  bitRate: 8e6,
  maxFps: 0,
  lockVideoOrientation: VideoOrientation.Unlocked,
  tunnelForward: false,
  crop: void 0,
  sendFrameMeta: true,
  control: true,
  displayId: 0,
  showTouches: false,
  stayAwake: false,
  codecOptions: void 0
};

// node_modules/@yume-chan/scrcpy/esm/utils/clamp.js
function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

// node_modules/@yume-chan/scrcpy/esm/utils/constants.js
var DefaultServerPath = "/data/local/tmp/scrcpy-server.jar";

// node_modules/@yume-chan/scrcpy/esm/utils/omit.js
// @__NO_SIDE_EFFECTS__
function omit(value, ...keys) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/inject-touch.js
var UnsignedFloat = field(2, "byob", (source, { buffer: buffer2, index, littleEndian }) => {
  source = clamp(source, -1, 1);
  source = source === 1 ? 65535 : source * 65536;
  setUint16(buffer2, index, source, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(2));
  const value = getUint16(data, 0, littleEndian);
  return value === 65535 ? 1 : value / 65536;
});
var PointerId = {
  Mouse: -1n,
  Finger: -2n,
  VirtualMouse: -3n,
  VirtualFinger: -4n
};
var InjectTouchControlMessage = struct({
  type: u8,
  action: u8(),
  pointerId: u64,
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  pressure: UnsignedFloat,
  buttons: u32
}, { littleEndian: false });
function serializeInjectTouchControlMessage(message) {
  return InjectTouchControlMessage.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/media-stream-transformer.js
var MediaStreamRawPacket = struct({ pts: u64, data: buffer(u32) }, { littleEndian: false });
var PtsConfig = 1n << 63n;
function createMediaStreamTransformer(options) {
  if (!options.sendFrameMeta) {
    return new TransformStream({
      transform(chunk, controller) {
        controller.enqueue({
          type: "data",
          data: chunk
        });
      }
    });
  }
  const deserializeStream = new StructDeserializeStream(MediaStreamRawPacket);
  return {
    writable: deserializeStream.writable,
    readable: deserializeStream.readable.pipeThrough(new TransformStream({
      transform(packet, controller) {
        if (packet.pts === PtsConfig) {
          controller.enqueue({
            type: "configuration",
            data: packet.data
          });
          return;
        }
        controller.enqueue({
          type: "data",
          pts: packet.pts,
          data: packet.data
        });
      }
    }))
  };
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/parse-display.js
function parseDisplay(line) {
  const match = line.match(/^\s+scrcpy --display (\d+)$/);
  if (match) {
    return {
      id: Number.parseInt(match[1], 10)
    };
  }
  return void 0;
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/parse-video-stream-metadata.js
async function readString(stream, maxLength) {
  const buffer2 = await stream.readExactly(maxLength);
  return decodeUtf8(buffer2.subarray(0, buffer2.indexOf(0)));
}
async function readU16(stream) {
  const buffer2 = await stream.readExactly(2);
  return getUint16BigEndian(buffer2, 0);
}
async function readU32(stream) {
  const buffer2 = await stream.readExactly(4);
  return getUint32BigEndian(buffer2, 0);
}
async function parseVideoStreamMetadata(stream) {
  const buffered = new BufferedReadableStream(stream);
  const metadata = {
    codec: ScrcpyVideoCodecId.H264
  };
  metadata.deviceName = await readString(buffered, 64);
  metadata.width = await readU16(buffered);
  metadata.height = await readU16(buffered);
  return { stream: buffered.release(), metadata };
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/scroll-controller.js
var InjectScrollControlMessage = struct({
  type: u8,
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  scrollX: s32,
  scrollY: s32
}, { littleEndian: false });
var ScrollController = class {
  #accumulatedX = 0;
  #accumulatedY = 0;
  processMessage(message) {
    if (message.scrollX) {
      if (Math.sign(message.scrollX) !== Math.sign(this.#accumulatedX)) {
        this.#accumulatedX = message.scrollX;
      } else {
        this.#accumulatedX += message.scrollX;
      }
    }
    if (message.scrollY) {
      if (Math.sign(message.scrollY) !== Math.sign(this.#accumulatedY)) {
        this.#accumulatedY = message.scrollY;
      } else {
        this.#accumulatedY += message.scrollY;
      }
    }
    const integerX = this.#accumulatedX | 0;
    this.#accumulatedX -= integerX;
    const integerY = this.#accumulatedY | 0;
    this.#accumulatedY -= integerY;
    if (integerX === 0 && integerY === 0) {
      return void 0;
    }
    message.scrollX = integerX;
    message.scrollY = integerY;
    return message;
  }
  serializeScrollMessage(message) {
    const processed = this.processMessage(message);
    if (!processed) {
      return void 0;
    }
    return InjectScrollControlMessage.serialize(processed);
  }
};
function createScrollController() {
  return new ScrollController();
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/serialize-order.js
var SerializeOrder = [
  "logLevel",
  "maxSize",
  "bitRate",
  "maxFps",
  "lockVideoOrientation",
  "tunnelForward",
  "crop",
  "sendFrameMeta",
  "control",
  "displayId",
  "showTouches",
  "stayAwake",
  "codecOptions"
];

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/serialize.js
function serialize(options, order) {
  return order.map((key) => toScrcpyOptionValue(options[key], "-"));
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/set-clipboard.js
var SetClipboardControlMessage = struct({ type: u8, content: string(u32) }, { littleEndian: false });
function serializeSetClipboardControlMessage(message) {
  return SetClipboardControlMessage.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/set-list-display.js
function setListDisplays(options) {
  options.displayId = -1;
}

// node_modules/@yume-chan/scrcpy/esm/1_15/options.js
var ScrcpyOptions1_15 = class {
  static Defaults = Defaults;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults, ...init };
    if (this.value.control) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
    }
  }
  serialize() {
    return serialize(this.value, SerializeOrder);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata(stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage(message);
  }
  serializeSetClipboardControlMessage(message) {
    return serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController();
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_15_1.js
var ScrcpyOptions1_15_1 = class extends ScrcpyOptions1_15 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_16.js
var ScrcpyOptions1_16 = class extends ScrcpyOptions1_15 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_17/impl/index.js
var impl_exports2 = {};
__export(impl_exports2, {
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes,
  Crop: () => Crop,
  Defaults: () => Defaults2,
  EncoderRegex: () => EncoderRegex,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder2,
  SetClipboardControlMessage: () => SetClipboardControlMessage,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_17/impl/defaults.js
var Defaults2 = /* @__PURE__ */ (() => ({
  ...impl_exports.Defaults,
  encoderName: void 0
}))();

// node_modules/@yume-chan/scrcpy/esm/1_17/impl/parse-encoder.js
function parseEncoder(line, encoderNameRegex) {
  const match = line.match(encoderNameRegex);
  if (match) {
    return { type: "video", name: match[1] };
  }
  return void 0;
}
var EncoderRegex = /^\s+scrcpy --encoder-name '([^']+)'$/;

// node_modules/@yume-chan/scrcpy/esm/1_17/impl/serialize-order.js
var SerializeOrder2 = /* @__PURE__ */ (() => [
  ...impl_exports.SerializeOrder,
  "encoderName"
])();

// node_modules/@yume-chan/scrcpy/esm/1_17/impl/set-list-encoder.js
function setListEncoders(options) {
  options.encoderName = "_";
}

// node_modules/@yume-chan/scrcpy/esm/1_17/options.js
var ScrcpyOptions1_17 = class {
  static Defaults = Defaults2;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults2, ...init };
    if (this.value.control) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
    }
  }
  serialize() {
    return serialize(this.value, SerializeOrder2);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata(stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage(message);
  }
  serializeSetClipboardControlMessage(message) {
    return serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController();
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/index.js
var impl_exports3 = {};
__export(impl_exports3, {
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults3,
  EncoderRegex: () => EncoderRegex2,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/back-or-screen-on.js
var BackOrScreenOnControlMessage2 = extend(impl_exports2.BackOrScreenOnControlMessage, { action: u8() });
function serializeBackOrScreenOnControlMessage2(message) {
  return BackOrScreenOnControlMessage2.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/control-message-types.js
var ControlMessageTypes2 = /* @__PURE__ */ (() => {
  const result = impl_exports2.ControlMessageTypes.slice();
  result.splice(6, 0, ScrcpyControlMessageType.ExpandSettingPanel);
  return result;
})();

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/init.js
var VideoOrientation2 = {
  Initial: -2,
  Unlocked: -1,
  Portrait: 0,
  Landscape: 1,
  PortraitFlipped: 2,
  LandscapeFlipped: 3
};

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/defaults.js
var Defaults3 = /* @__PURE__ */ (() => ({
  ...impl_exports2.Defaults,
  logLevel: "debug",
  lockVideoOrientation: VideoOrientation2.Unlocked,
  powerOffOnClose: false
}))();

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/parse-encoder.js
var EncoderRegex2 = /^\s+scrcpy --encoder '([^']+)'$/;

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/serialize-order.js
var SerializeOrder3 = /* @__PURE__ */ (() => [
  ...impl_exports2.SerializeOrder,
  "powerOffOnClose"
])();

// node_modules/@yume-chan/scrcpy/esm/1_18/options.js
var ScrcpyOptions1_18 = class {
  static Defaults = Defaults3;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults3, ...init };
    if (this.value.control) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
    }
  }
  serialize() {
    return serialize(this.value, SerializeOrder3);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex2);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata(stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController();
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_19.js
var ScrcpyOptions1_19 = class extends ScrcpyOptions1_18 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_20.js
var ScrcpyOptions1_20 = class extends ScrcpyOptions1_18 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_21/impl/index.js
var impl_exports4 = {};
__export(impl_exports4, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults4,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_21/impl/defaults.js
var Defaults4 = /* @__PURE__ */ (() => ({
  ...impl_exports3.Defaults,
  clipboardAutosync: true
}))();

// node_modules/@yume-chan/scrcpy/esm/1_21/impl/parse-encoder.js
var EncoderRegex3 = /^\s+scrcpy --encoder-name '([^']+)'$/;

// node_modules/@yume-chan/scrcpy/esm/1_21/impl/serialize.js
function toSnakeCase(input) {
  return input.replace(/([A-Z])/g, "_$1").toLowerCase();
}
function serialize2(options, defaults) {
  const result = [];
  for (const [key, value] of Object.entries(options)) {
    const serializedValue = toScrcpyOptionValue(value, void 0);
    if (serializedValue === void 0) {
      continue;
    }
    const defaultValue = toScrcpyOptionValue(defaults[key], void 0);
    if (serializedValue === defaultValue) {
      continue;
    }
    result.push(`${toSnakeCase(key)}=${serializedValue}`);
  }
  return result;
}

// node_modules/@yume-chan/scrcpy/esm/1_21/impl/set-clipboard.js
var AckClipboardDeviceMessage = struct({ sequence: u64 }, { littleEndian: false });
var SetClipboardControlMessage2 = struct({
  type: u8,
  sequence: u64,
  paste: u8(),
  content: string(u32)
}, { littleEndian: false });
var AckClipboardHandler = class {
  #resolvers = /* @__PURE__ */ new Map();
  #closed = false;
  id = 1;
  async parse(_id, stream) {
    const message = await AckClipboardDeviceMessage.deserialize(stream);
    const resolver = this.#resolvers.get(message.sequence);
    if (resolver) {
      resolver.resolve();
      this.#resolvers.delete(message.sequence);
    }
  }
  close() {
    for (const resolver of this.#resolvers.values()) {
      resolver.reject();
    }
    this.#resolvers.clear();
    this.#closed = true;
  }
  error(e) {
    for (const resolver of this.#resolvers.values()) {
      resolver.reject(e);
    }
    this.#resolvers.clear();
    this.#closed = true;
  }
  serializeSetClipboardControlMessage(message) {
    if (message.sequence === 0n) {
      return SetClipboardControlMessage2.serialize(message);
    }
    if (this.#closed) {
      throw new Error();
    }
    const resolver = new PromiseResolver();
    this.#resolvers.set(message.sequence, resolver);
    return [
      SetClipboardControlMessage2.serialize(message),
      resolver.promise
    ];
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_21/options.js
var ScrcpyOptions1_21 = class {
  static Defaults = Defaults4;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults4, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults4);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex3);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata(stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController();
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_22/impl/index.js
var impl_exports5 = {};
__export(impl_exports5, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults5,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage2,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController2,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController2,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata2,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_22/impl/defaults.js
var Defaults5 = /* @__PURE__ */ (() => ({
  ...impl_exports4.Defaults,
  downsizeOnError: true,
  sendDeviceMeta: true,
  sendDummyByte: true
}))();

// node_modules/@yume-chan/scrcpy/esm/1_22/impl/parse-video-stream-metadata.js
async function parseVideoStreamMetadata2(options, stream) {
  if (!options.sendDeviceMeta) {
    return { stream, metadata: { codec: ScrcpyVideoCodecId.H264 } };
  } else {
    return impl_exports4.parseVideoStreamMetadata(stream);
  }
}

// node_modules/@yume-chan/scrcpy/esm/1_22/impl/scroll-controller.js
var InjectScrollControlMessage2 = extend(impl_exports4.InjectScrollControlMessage, { buttons: s32 });
var ScrollController2 = class extends impl_exports4.ScrollController {
  serializeScrollMessage(message) {
    const processed = this.processMessage(message);
    if (!processed) {
      return void 0;
    }
    return InjectScrollControlMessage2.serialize(processed);
  }
};
function createScrollController2() {
  return new ScrollController2();
}

// node_modules/@yume-chan/scrcpy/esm/1_22/options.js
var ScrcpyOptions1_22 = class {
  static Defaults = Defaults5;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults5, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults5);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex3);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata2(this.value, stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController2();
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_23/impl/index.js
var impl_exports6 = {};
__export(impl_exports6, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults6,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage2,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController2,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController2,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata2,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_23/impl/defaults.js
var Defaults6 = /* @__PURE__ */ (() => ({
  ...impl_exports5.Defaults,
  cleanup: true
}))();

// node_modules/@yume-chan/scrcpy/esm/1_23/impl/media-stream-transformer.js
var PtsKeyframe = 1n << 62n;
function createMediaStreamTransformer2(options) {
  if (!options.sendFrameMeta) {
    return new TransformStream({
      transform(chunk, controller) {
        controller.enqueue({
          type: "data",
          data: chunk
        });
      }
    });
  }
  const deserializeStream = new StructDeserializeStream(impl_exports5.MediaStreamRawPacket);
  return {
    writable: deserializeStream.writable,
    readable: deserializeStream.readable.pipeThrough(new TransformStream({
      transform(packet, controller) {
        if (packet.pts === impl_exports5.PtsConfig) {
          controller.enqueue({
            type: "configuration",
            data: packet.data
          });
          return;
        }
        if (packet.pts & PtsKeyframe) {
          controller.enqueue({
            type: "data",
            keyframe: true,
            pts: packet.pts & ~PtsKeyframe,
            data: packet.data
          });
          return;
        }
        controller.enqueue({
          type: "data",
          keyframe: false,
          pts: packet.pts,
          data: packet.data
        });
      }
    }))
  };
}

// node_modules/@yume-chan/scrcpy/esm/1_23/options.js
var ScrcpyOptions1_23 = class {
  static Defaults = Defaults6;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults6, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults6);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex3);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata2(this.value, stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController2();
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_24/impl/defaults.js
var Defaults7 = /* @__PURE__ */ (() => ({
  ...impl_exports6.Defaults,
  powerOn: true
}))();

// node_modules/@yume-chan/scrcpy/esm/1_24/options.js
var ScrcpyOptions1_24 = class {
  static Defaults = Defaults7;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults7, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults7);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex3);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata2(this.value, stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController2();
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_25/impl/index.js
var impl_exports7 = {};
__export(impl_exports7, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults7,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata2,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_25/impl/scroll-controller.js
var SignedFloat = field(2, "byob", (value, { buffer: buffer2, index, littleEndian }) => {
  value = clamp(value, -1, 1);
  value = value === 1 ? 32767 : value * 32768;
  setInt16(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(2));
  const value = getInt16(data, 0, littleEndian);
  return value === 32767 ? 1 : value / 32768;
});
var InjectScrollControlMessage3 = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.InjectScroll),
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  scrollX: SignedFloat,
  scrollY: SignedFloat,
  buttons: u32
}, { littleEndian: false }))();
var ScrollController3 = class {
  serializeScrollMessage(message) {
    return InjectScrollControlMessage3.serialize(message);
  }
};
function createScrollController3() {
  return new ScrollController3();
}

// node_modules/@yume-chan/scrcpy/esm/1_25/options.js
var ScrcpyOptions1_25 = class {
  static Defaults = Defaults7;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults7, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults7);
  }
  setListDisplays() {
    setListDisplays(this.value);
  }
  parseDisplay(line) {
    return parseDisplay(line);
  }
  setListEncoders() {
    setListEncoders(this.value);
  }
  parseEncoder(line) {
    return parseEncoder(line, EncoderRegex3);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata2(this.value, stream);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/index.js
var impl_exports8 = {};
__export(impl_exports8, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults8,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay2,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/defaults.js
var Defaults8 = /* @__PURE__ */ (() => ({
  ...omit(impl_exports7.Defaults, "bitRate", "codecOptions", "encoderName"),
  scid: void 0,
  videoCodec: "h264",
  videoBitRate: 8e6,
  videoCodecOptions: void 0,
  videoEncoder: void 0,
  audio: true,
  audioCodec: "opus",
  audioBitRate: 128e3,
  audioCodecOptions: void 0,
  audioEncoder: void 0,
  listEncoders: false,
  listDisplays: false,
  sendCodecMeta: true
}))();

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/init.js
var InstanceId = class _InstanceId {
  static NONE = /* @__PURE__ */ new _InstanceId(-1);
  static random() {
    return new _InstanceId(Math.random() * 2147483648 | 0);
  }
  value;
  constructor(value) {
    this.value = value;
  }
  toOptionValue() {
    if (this.value < 0) {
      return void 0;
    }
    return this.value.toString(16);
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/inject-touch.js
var InjectTouchControlMessage2 = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.InjectTouch),
  action: u8(),
  pointerId: u64,
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  pressure: impl_exports7.UnsignedFloat,
  actionButton: u32,
  buttons: u32
}, { littleEndian: false }))();
function serializeInjectTouchControlMessage2(message) {
  return InjectTouchControlMessage2.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-audio-stream-metadata.js
async function parseAudioStreamMetadata(stream, options) {
  const buffered = new BufferedReadableStream(stream);
  const buffer2 = await buffered.readExactly(4);
  const codecMetadataValue = getUint32BigEndian(buffer2, 0);
  switch (codecMetadataValue) {
    case 0:
      return {
        type: "disabled"
      };
    case 1:
      return {
        type: "errored"
      };
  }
  if (options.sendCodecMeta) {
    let codec2;
    switch (codecMetadataValue) {
      case ScrcpyAudioCodec.Raw.metadataValue:
        codec2 = ScrcpyAudioCodec.Raw;
        break;
      case ScrcpyAudioCodec.Opus.metadataValue:
        codec2 = ScrcpyAudioCodec.Opus;
        break;
      case ScrcpyAudioCodec.Aac.metadataValue:
        codec2 = ScrcpyAudioCodec.Aac;
        break;
      case ScrcpyAudioCodec.Flac.metadataValue:
        codec2 = ScrcpyAudioCodec.Flac;
        break;
      default:
        throw new Error(`Unknown audio codec metadata value: ${codecMetadataValue}`);
    }
    return {
      type: "success",
      codec: codec2,
      stream: buffered.release()
    };
  }
  let codec;
  switch (options.audioCodec) {
    case "raw":
      codec = ScrcpyAudioCodec.Raw;
      break;
    case "opus":
      codec = ScrcpyAudioCodec.Opus;
      break;
    case "aac":
      codec = ScrcpyAudioCodec.Aac;
      break;
    case "flac":
      codec = ScrcpyAudioCodec.Flac;
      break;
    default:
      throw new Error(`Unknown audio codec metadata value: ${codecMetadataValue}`);
  }
  return {
    type: "success",
    codec,
    stream: new PushReadableStream(async (controller) => {
      await controller.enqueue(buffer2);
      const stream2 = buffered.release();
      const reader = stream2.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        await controller.enqueue(value);
      }
    })
  };
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-display.js
function parseDisplay2(line) {
  const match = line.match(/^\s+--display=(\d+)\s+\(([^)]+)\)$/);
  if (match) {
    const display = {
      id: Number.parseInt(match[1], 10)
    };
    if (match[2] !== "size unknown") {
      display.resolution = match[2];
    }
    return display;
  }
  return void 0;
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-encoder.js
var EncoderRegex4 = /^\s+--(video|audio)-codec=(\S+)\s+--\1-encoder='([^']+)'$/;
function parseEncoder2(line) {
  const match = line.match(EncoderRegex4);
  return match ? {
    type: match[1],
    name: match[3],
    codec: match[2]
  } : void 0;
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-video-stream-metadata.js
function toCodecId(codec) {
  switch (codec) {
    case "h264":
      return ScrcpyVideoCodecId.H264;
    case "h265":
      return ScrcpyVideoCodecId.H265;
    case "av1":
      return ScrcpyVideoCodecId.AV1;
    default:
      throw new Error(`Unknown video codec: ${codec}`);
  }
}
async function parseAsync(options, stream) {
  const buffered = new BufferedReadableStream(stream);
  let deviceName;
  if (options.sendDeviceMeta) {
    deviceName = await impl_exports7.readString(buffered, 64);
  }
  let codec;
  let width;
  let height;
  if (options.sendCodecMeta) {
    codec = await impl_exports7.readU32(buffered);
    width = await impl_exports7.readU32(buffered);
    height = await impl_exports7.readU32(buffered);
  } else {
    codec = toCodecId(options.videoCodec);
  }
  return {
    stream: buffered.release(),
    metadata: { deviceName, codec, width, height }
  };
}
function parseVideoStreamMetadata3(options, stream) {
  if (!options.sendDeviceMeta && !options.sendCodecMeta) {
    return {
      stream,
      metadata: { codec: toCodecId(options.videoCodec) }
    };
  }
  return parseAsync(options, stream);
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/set-list-display.js
function setListDisplays2(options) {
  options.listDisplays = true;
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/set-list-encoder.js
function setListEncoders2(options) {
  options.listEncoders = true;
}

// node_modules/@yume-chan/scrcpy/esm/2_0/options.js
var ScrcpyOptions2_0 = class {
  static Defaults = Defaults8;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults8, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults8);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay2(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_1/impl/index.js
var impl_exports9 = {};
__export(impl_exports9, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults9,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay2,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_1/impl/defaults.js
var Defaults9 = /* @__PURE__ */ (() => ({
  ...impl_exports8.Defaults,
  video: true,
  audioSource: "output"
}))();

// node_modules/@yume-chan/scrcpy/esm/2_1/options.js
var ScrcpyOptions2_1 = class {
  static Defaults = Defaults9;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults9, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults9);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay2(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_1_1.js
var ScrcpyOptions2_1_1 = class extends ScrcpyOptions2_1 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_2/impl/defaults.js
var Defaults10 = /* @__PURE__ */ (() => ({
  ...impl_exports9.Defaults,
  videoSource: "display",
  displayId: 0,
  cameraId: void 0,
  cameraSize: void 0,
  cameraFacing: void 0,
  cameraAr: void 0,
  cameraFps: void 0,
  cameraHighSpeed: false,
  listCameras: false,
  listCameraSizes: false
}))();

// node_modules/@yume-chan/scrcpy/esm/2_2/impl/parse-display.js
function parseDisplay3(line) {
  const match = line.match(/^\s+--display-id=(\d+)\s+\(([^)]+)\)$/);
  if (match) {
    const display = {
      id: Number.parseInt(match[1], 10)
    };
    if (match[2] !== "size unknown") {
      display.resolution = match[2];
    }
    return display;
  }
  return void 0;
}

// node_modules/@yume-chan/scrcpy/esm/2_2/options.js
var ScrcpyOptions2_2 = class {
  static Defaults = Defaults10;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults10, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults10);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_3/impl/index.js
var impl_exports10 = {};
__export(impl_exports10, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults10,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_3/options.js
var ScrcpyOptions2_3 = class {
  static Defaults = Defaults10;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults10, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults10);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_3_1.js
var ScrcpyOptions2_3_1 = class extends ScrcpyOptions2_3 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_4/impl/index.js
var impl_exports11 = {};
__export(impl_exports11, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes3,
  Crop: () => Crop,
  Defaults: () => Defaults10,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_4/impl/control-message-types.js
var ControlMessageTypes3 = /* @__PURE__ */ (() => [
  ...impl_exports10.ControlMessageTypes,
  ScrcpyControlMessageType.UHidCreate,
  ScrcpyControlMessageType.UHidInput,
  ScrcpyControlMessageType.OpenHardKeyboardSettings
])();

// node_modules/@yume-chan/scrcpy/esm/2_4/impl/serialize-uhid-create.js
var UHidCreateControlMessage = struct({
  type: u8,
  id: u16,
  data: buffer(u16)
}, { littleEndian: false });
function serializeUHidCreateControlMessage(message) {
  return UHidCreateControlMessage.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/2_4/impl/uhid-output-stream.js
var UHidOutputDeviceMessage = struct({
  id: u16,
  data: buffer(u16)
}, { littleEndian: false });
var UHidOutputStream = class extends PushReadableStream {
  #controller;
  id = 2;
  constructor() {
    let controller;
    super((controller_) => {
      controller = controller_;
    });
    this.#controller = controller;
  }
  async parse(_id, stream) {
    const message = await UHidOutputDeviceMessage.deserialize(stream);
    await this.#controller.enqueue(message);
  }
  close() {
    this.#controller.close();
  }
  error(e) {
    this.#controller.error(e);
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_4/options.js
var ScrcpyOptions2_4 = class {
  static Defaults = Defaults10;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes3;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults10, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults10);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage(message);
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_5.js
var ScrcpyOptions2_5 = class extends ScrcpyOptions2_4 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_6/impl/index.js
var impl_exports12 = {};
__export(impl_exports12, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes3,
  Crop: () => Crop,
  Defaults: () => Defaults11,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_6/impl/defaults.js
var Defaults11 = /* @__PURE__ */ (() => ({
  ...impl_exports11.Defaults,
  audioDup: false
}))();

// node_modules/@yume-chan/scrcpy/esm/2_6/options.js
var ScrcpyOptions2_6 = class {
  static Defaults = Defaults11;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes3;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults11, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults11);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage(message);
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_6_1.js
var ScrcpyOptions2_6_1 = class extends ScrcpyOptions2_6 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_7/impl/index.js
var impl_exports13 = {};
__export(impl_exports13, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes4,
  Crop: () => Crop,
  Defaults: () => Defaults11,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage2,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage2,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_7/impl/control-message-types.js
var ControlMessageTypes4 = /* @__PURE__ */ (() => {
  const result = impl_exports12.ControlMessageTypes.slice();
  result.splice(14, 0, ScrcpyControlMessageType.UHidDestroy);
  return result;
})();

// node_modules/@yume-chan/scrcpy/esm/2_7/impl/serialize-uhid-create.js
var UHidCreateControlMessage2 = struct({
  type: u8,
  id: u16,
  name: string(u8),
  data: buffer(u16)
}, { littleEndian: false });
function serializeUHidCreateControlMessage2(message) {
  return UHidCreateControlMessage2.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/2_7/options.js
var ScrcpyOptions2_7 = class {
  static Defaults = Defaults11;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes4;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults11, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults11);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage2(message);
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_0/impl/index.js
var impl_exports14 = {};
__export(impl_exports14, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  CaptureOrientation: () => CaptureOrientation,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes5,
  Crop: () => Crop,
  Defaults: () => Defaults12,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  LockOrientation: () => LockOrientation,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  NewDisplay: () => NewDisplay,
  Orientation: () => Orientation,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage2,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder3,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage2,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/3_0/impl/control-message-types.js
var ControlMessageTypes5 = /* @__PURE__ */ (() => [
  ...impl_exports13.ControlMessageTypes,
  ScrcpyControlMessageType.StartApp,
  ScrcpyControlMessageType.ResetVideo
])();

// node_modules/@yume-chan/scrcpy/esm/3_0/impl/defaults.js
var Defaults12 = /* @__PURE__ */ (() => ({
  ...omit(impl_exports13.Defaults, "lockVideoOrientation"),
  captureOrientation: void 0,
  angle: 0,
  screenOffTimeout: void 0,
  listApps: false,
  newDisplay: void 0,
  vdSystemDecorations: true
}))();

// node_modules/@yume-chan/scrcpy/esm/3_0/impl/init.js
var LockOrientation = {
  Unlocked: 0,
  LockedInitial: 1,
  LockedValue: 2
};
var Orientation = {
  Orient0: 0,
  Orient90: 90,
  Orient180: 180,
  Orient270: 270
};
var CaptureOrientation = class _CaptureOrientation {
  static Unlocked = /* @__PURE__ */ (() => new _CaptureOrientation(LockOrientation.Unlocked, Orientation.Orient0, false))();
  lock;
  orientation;
  flip;
  constructor(lock, orientation, flip = false) {
    this.lock = lock;
    this.orientation = orientation;
    this.flip = flip;
  }
  toOptionValue() {
    if (this.lock === LockOrientation.Unlocked && this.orientation === Orientation.Orient0 && !this.flip) {
      return void 0;
    }
    if (this.lock === LockOrientation.LockedInitial) {
      return "@";
    }
    return (this.lock === LockOrientation.LockedValue ? "@" : "") + (this.flip ? "flip" : "") + this.orientation;
  }
};
var NewDisplay = class _NewDisplay {
  static Default = /* @__PURE__ */ new _NewDisplay();
  width;
  height;
  dpi;
  constructor(a, b, c) {
    if (a === void 0) {
      return;
    }
    if (b === void 0) {
      this.dpi = a;
      return;
    }
    this.width = a;
    this.height = b;
    this.dpi = c;
  }
  toOptionValue() {
    if (this.width === void 0 && this.height === void 0 && this.dpi === void 0) {
      return "";
    }
    if (this.width === void 0) {
      return `/${this.dpi}`;
    }
    if (this.dpi === void 0) {
      return `${this.width}x${this.height}`;
    }
    return `${this.width}x${this.height}/${this.dpi}`;
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_0/impl/parse-encoder.js
var EncoderRegex5 = /^\s+--(video|audio)-codec=(\S+)\s+--\1-encoder=(\S+)(?:\s*\((sw|hw|hybrid)\))?(?:\s*\[vendor\])?(?:\s*\(alias for (\S+)\))?$/;
function toHardwareType(value) {
  switch (value) {
    case "sw":
      return "software";
    case "hw":
      return "hardware";
    case "hybrid":
      return "hybrid";
    default:
      throw new Error(`Unknown hardware type: ${value}`);
  }
}
function parseEncoder3(line) {
  const match = line.match(EncoderRegex5);
  return match ? {
    type: match[1],
    name: match[3],
    codec: match[2],
    hardwareType: match[4] ? toHardwareType(match[4]) : void 0,
    vendor: !!match[5],
    aliasFor: match[6]
  } : void 0;
}

// node_modules/@yume-chan/scrcpy/esm/3_0/options.js
var ScrcpyOptions3_0 = class {
  static Defaults = Defaults12;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes5;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults12, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults12);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder3(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage2(message);
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_0_1.js
var ScrcpyOptions3_0_1 = class extends ScrcpyOptions3_0 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_0_2.js
var ScrcpyOptions3_0_2 = class extends ScrcpyOptions3_0 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_1/impl/index.js
var impl_exports15 = {};
__export(impl_exports15, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  CaptureOrientation: () => CaptureOrientation,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes5,
  Crop: () => Crop,
  Defaults: () => Defaults13,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  LockOrientation: () => LockOrientation,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  NewDisplay: () => NewDisplay,
  Orientation: () => Orientation,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage3,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder3,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage3,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/3_1/impl/defaults.js
var Defaults13 = /* @__PURE__ */ (() => ({
  ...impl_exports14.Defaults,
  vdDestroyContent: false
}))();

// node_modules/@yume-chan/scrcpy/esm/3_1/impl/serialize-uhid-create.js
var UHidCreateControlMessage3 = struct({
  type: u8,
  id: u16,
  vendorId: u16,
  productId: u16,
  name: string(u8),
  data: buffer(u16)
}, { littleEndian: false });
function serializeUHidCreateControlMessage3(message) {
  return UHidCreateControlMessage3.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/3_1/options.js
var ScrcpyOptions3_1 = class {
  static Defaults = Defaults13;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes5;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults13, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults13);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder3(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage3(message);
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_2/impl/index.js
var impl_exports16 = {};
__export(impl_exports16, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  CaptureOrientation: () => CaptureOrientation,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes5,
  Crop: () => Crop,
  Defaults: () => Defaults14,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  LockOrientation: () => LockOrientation,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  NewDisplay: () => NewDisplay,
  Orientation: () => Orientation,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage3,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder3,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage3,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/3_2/impl/defaults.js
var Defaults14 = /* @__PURE__ */ (() => ({
  ...impl_exports15.Defaults,
  displayImePolicy: void 0
}))();

// node_modules/@yume-chan/scrcpy/esm/3_2/options.js
var ScrcpyOptions3_2 = class {
  static Defaults = Defaults14;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes5;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults14, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults14);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder3(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage3(message);
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_3.js
var ScrcpyOptions3_3 = class extends ScrcpyOptions3_2 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_3_1/impl/scroll-controller.js
var ScrollController4 = class {
  serializeScrollMessage(message) {
    message = {
      ...message,
      scrollX: message.scrollX / 16,
      scrollY: message.scrollY / 16
    };
    return impl_exports16.InjectScrollControlMessage.serialize(message);
  }
};
function createScrollController4() {
  return new ScrollController4();
}

// node_modules/@yume-chan/scrcpy/esm/3_3_1/options.js
var ScrcpyOptions3_3_1 = class {
  static Defaults = Defaults14;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes5;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults14, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults14);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder3(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController4();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage3(message);
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_3_2.js
var ScrcpyOptions3_3_2 = class extends ScrcpyOptions3_3_1 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/codec/av1.js
var AndroidAv1Profile = {
  Main8: 1 << 0,
  Main10: 1 << 1,
  Main10Hdr10: 1 << 12,
  Main10Hdr10Plus: 1 << 13
};
var AndroidAv1Level = {
  Level2: 1 << 0,
  Level21: 1 << 1,
  Level22: 1 << 2,
  Level23: 1 << 3,
  Level3: 1 << 4,
  Level31: 1 << 5,
  Level32: 1 << 6,
  Level33: 1 << 7,
  Level4: 1 << 8,
  Level41: 1 << 9,
  Level42: 1 << 10,
  Level43: 1 << 11,
  Level5: 1 << 12,
  Level51: 1 << 13,
  Level52: 1 << 14,
  Level53: 1 << 15,
  Level6: 1 << 16,
  Level61: 1 << 17,
  Level62: 1 << 18,
  Level63: 1 << 19,
  Level7: 1 << 20,
  Level71: 1 << 21,
  Level72: 1 << 22,
  Level73: 1 << 23
};
var BitReader = class {
  #data;
  #byte;
  #bytePosition = 0;
  #bitPosition = 7;
  get byteAligned() {
    return this.#bitPosition === 7;
  }
  get ended() {
    return this.#bytePosition >= this.#data.length;
  }
  constructor(data) {
    this.#data = data;
    this.#byte = data[0];
  }
  f1() {
    const value = this.#byte >> this.#bitPosition;
    this.#bitPosition -= 1;
    if (this.#bitPosition < 0) {
      this.#bytePosition += 1;
      this.#bitPosition = 7;
      this.#byte = this.#data[this.#bytePosition];
    }
    return value & 1;
  }
  f(n) {
    let value = 0;
    for (; n > 0; n -= 1) {
      value <<= 1;
      value |= this.f1();
    }
    return value;
  }
  skip(n) {
    if (n <= this.#bitPosition + 1) {
      this.#bytePosition += 1;
      this.#bitPosition = 7;
      this.#byte = this.#data[this.#bytePosition];
      return;
    }
    n -= this.#bitPosition + 1;
    this.#bytePosition += 1;
    const bytes = n / 8 | 0;
    if (bytes > 0) {
      this.#bytePosition += bytes;
      n -= bytes * 8;
    }
    this.#bitPosition = 7 - n;
    this.#byte = this.#data[this.#bytePosition];
  }
  readBytes(n) {
    if (!this.byteAligned) {
      throw new Error("Bytes must be byte-aligned");
    }
    const value = this.#data.subarray(this.#bytePosition, this.#bytePosition + n);
    this.#bytePosition += n;
    this.#byte = this.#data[this.#bytePosition];
    return value;
  }
  getPosition() {
    return [this.#bytePosition, this.#bitPosition];
  }
  setPosition([bytePosition, bitPosition]) {
    this.#bytePosition = bytePosition;
    this.#bitPosition = bitPosition;
    this.#byte = this.#data[bytePosition];
  }
};
var ObuType = {
  SequenceHeader: 1,
  TemporalDelimiter: 2,
  FrameHeader: 3,
  TileGroup: 4,
  Metadata: 5,
  Frame: 6,
  RedundantFrameHeader: 7,
  TileList: 8,
  Padding: 15
};
var ColorPrimaries = {
  Bt709: 1,
  Unspecified: 2,
  Bt470M: 4,
  Bt470BG: 5,
  Bt601: 6,
  Smpte240: 7,
  GenericFilm: 8,
  Bt2020: 9,
  Xyz: 10,
  Smpte431: 11,
  Smpte432: 12,
  Ebu3213: 22
};
var TransferCharacteristics = {
  Bt709: 1,
  Unspecified: 2,
  Bt470M: 4,
  Bt470BG: 5,
  Bt601: 6,
  Smpte240: 7,
  Linear: 8,
  Log100: 9,
  Log100Sqrt10: 10,
  Iec61966: 11,
  Bt1361: 12,
  Srgb: 13,
  Bt2020Ten: 14,
  Bt2020Twelve: 15,
  Smpte2084: 16,
  Smpte428: 17,
  Hlg: 18
};
var MatrixCoefficients = {
  Identity: 0,
  Bt709: 1,
  Unspecified: 2,
  Fcc: 4,
  Bt470BG: 5,
  Bt601: 6,
  Smpte240: 7,
  YCgCo: 8,
  Bt2020Ncl: 9,
  Bt2020Cl: 10,
  Smpte2085: 11,
  ChromatNcl: 12,
  ChromatCl: 13,
  ICtCp: 14
};
var Av1 = class _Av1 extends BitReader {
  static ObuType = ObuType;
  static ColorPrimaries = ColorPrimaries;
  static TransferCharacteristics = TransferCharacteristics;
  static MatrixCoefficients = MatrixCoefficients;
  #Leb128Bytes = 0;
  uvlc() {
    let leadingZeros = 0;
    while (!this.f1()) {
      leadingZeros += 1;
    }
    if (leadingZeros >= 32) {
      return 2 ** 32 - 1;
    }
    const value = this.f(leadingZeros);
    return value + (1 << leadingZeros >>> 0) - 1;
  }
  leb128() {
    if (!this.byteAligned) {
      throw new Error("LEB128 must be byte-aligned");
    }
    let value = 0n;
    this.#Leb128Bytes = 0;
    for (let i = 0n; i < 8n; i += 1n) {
      const leb128_byte = this.f(8);
      value |= BigInt(leb128_byte & 127) << 7n * i;
      this.#Leb128Bytes += 1;
      if ((leb128_byte & 128) == 0) {
        break;
      }
    }
    return value;
  }
  *annexBBitstream() {
    while (!this.ended) {
      const temporal_unit_size = this.leb128();
      yield* this.temporalUnit(temporal_unit_size);
    }
  }
  *temporalUnit(sz) {
    while (sz > 0) {
      const frame_unit_size = this.leb128();
      sz -= BigInt(this.#Leb128Bytes);
      yield* this.frameUnit(frame_unit_size);
      sz -= frame_unit_size;
    }
  }
  *frameUnit(sz) {
    while (sz > 0) {
      const obu_length = this.leb128();
      sz -= BigInt(this.#Leb128Bytes);
      const obu = this.openBitstreamUnit(obu_length);
      if (obu) {
        yield obu;
      }
      sz -= obu_length;
    }
  }
  #OperatingPointIdc = 0;
  openBitstreamUnit(sz) {
    const obu_header = this.obuHeader();
    let obu_size;
    if (obu_header.obu_has_size_field) {
      obu_size = this.leb128();
    } else if (sz !== void 0) {
      obu_size = sz - 1n - (obu_header.obu_extension_flag ? 1n : 0n);
    } else {
      throw new Error("obu_has_size_field must be true");
    }
    const startPosition = this.getPosition();
    if (obu_header.obu_type !== _Av1.ObuType.SequenceHeader && obu_header.obu_type !== _Av1.ObuType.TemporalDelimiter && this.#OperatingPointIdc !== 0 && obu_header.obu_extension_header) {
      const inTemporalLayer = !!(this.#OperatingPointIdc & 1 << obu_header.obu_extension_header.temporal_id);
      const inSpatialLayer = !!(this.#OperatingPointIdc & 1 << obu_header.obu_extension_header.spatial_id + 8);
      if (!inTemporalLayer || !inSpatialLayer) {
        this.skip(Number(obu_size));
        return;
      }
    }
    let sequence_header_obu;
    switch (obu_header.obu_type) {
      case _Av1.ObuType.SequenceHeader:
        sequence_header_obu = this.sequenceHeaderObu();
        break;
    }
    const currentPosition = this.getPosition();
    const payloadBits = (currentPosition[0] - startPosition[0]) * 8 + (startPosition[1] - currentPosition[1]);
    if (obu_size > 0) {
      this.skip(Number(obu_size) * 8 - payloadBits);
    }
    return {
      obu_header,
      obu_size,
      sequence_header_obu
    };
  }
  obuHeader() {
    const obu_forbidden_bit = !!this.f1();
    if (obu_forbidden_bit) {
      throw new Error("Invalid data");
    }
    const obu_type = this.f(4);
    const obu_extension_flag = !!this.f1();
    const obu_has_size_field = !!this.f1();
    this.f1();
    let obu_extension_header;
    if (obu_extension_flag) {
      obu_extension_header = this.obuExtensionHeader();
    }
    return {
      obu_type,
      obu_extension_flag,
      obu_has_size_field,
      obu_extension_header
    };
  }
  obuExtensionHeader() {
    const temporal_id = this.f(3);
    const spatial_id = this.f(2);
    this.skip(3);
    return { temporal_id, spatial_id };
  }
  static SelectScreenContentTools = 2;
  static SelectIntegerMv = 2;
  sequenceHeaderObu() {
    const seq_profile = this.f(3);
    const still_picture = !!this.f1();
    const reduced_still_picture_header = !!this.f1();
    let timing_info_present_flag = false;
    let timing_info;
    let decoder_model_info_present_flag = false;
    let decoder_model_info;
    let initial_display_delay_present_flag = false;
    let operating_points_cnt_minus_1 = 0;
    const operating_point_idc = [];
    const seq_level_idx = [];
    const seq_tier = [];
    const decoder_model_present_for_this_op = [];
    const initial_display_delay_present_for_this_op = [];
    let operating_parameters_info;
    let initial_display_delay_minus_1;
    if (reduced_still_picture_header) {
      operating_point_idc[0] = 0;
      seq_level_idx[0] = this.f(5);
      seq_tier[0] = 0;
      decoder_model_present_for_this_op[0] = false;
      initial_display_delay_present_for_this_op[0] = false;
    } else {
      timing_info_present_flag = !!this.f1();
      if (timing_info_present_flag) {
        timing_info = this.timingInfo();
        decoder_model_info_present_flag = !!this.f1();
        if (decoder_model_info_present_flag) {
          decoder_model_info = this.decoderModelInfo();
          operating_parameters_info = [];
        }
      }
      initial_display_delay_present_flag = !!this.f1();
      if (initial_display_delay_present_flag) {
        initial_display_delay_minus_1 = [];
      }
      operating_points_cnt_minus_1 = this.f(5);
      for (let i = 0; i <= operating_points_cnt_minus_1; i += 1) {
        operating_point_idc[i] = this.f(12);
        seq_level_idx[i] = this.f(5);
        if (seq_level_idx[i] > 7) {
          seq_tier[i] = this.f1();
        } else {
          seq_tier[i] = 0;
        }
        if (decoder_model_info_present_flag) {
          decoder_model_present_for_this_op[i] = !!this.f1();
          if (decoder_model_present_for_this_op[i]) {
            operating_parameters_info[i] = this.operatingParametersInfo(decoder_model_info);
          }
        } else {
          decoder_model_present_for_this_op[i] = false;
        }
        if (initial_display_delay_present_flag) {
          initial_display_delay_present_for_this_op[i] = !!this.f1();
          if (initial_display_delay_present_for_this_op[i]) {
            initial_display_delay_minus_1[i] = this.f(4);
          }
        }
      }
    }
    const operatingPoint = this.chooseOperatingPoint();
    this.#OperatingPointIdc = operating_point_idc[operatingPoint];
    const frame_width_bits_minus_1 = this.f(4);
    const frame_height_bits_minus_1 = this.f(4);
    const max_frame_width_minus_1 = this.f(frame_width_bits_minus_1 + 1);
    const max_frame_height_minus_1 = this.f(frame_height_bits_minus_1 + 1);
    let frame_id_numbers_present_flag = false;
    let delta_frame_id_length_minus_2;
    let additional_frame_id_length_minus_1;
    if (!reduced_still_picture_header) {
      frame_id_numbers_present_flag = !!this.f1();
      if (frame_id_numbers_present_flag) {
        delta_frame_id_length_minus_2 = this.f(4);
        additional_frame_id_length_minus_1 = this.f(3);
      }
    }
    const use_128x128_superblock = !!this.f1();
    const enable_filter_intra = !!this.f1();
    const enable_intra_edge_filter = !!this.f1();
    let enable_interintra_compound = false;
    let enable_masked_compound = false;
    let enable_warped_motion = false;
    let enable_dual_filter = false;
    let enable_order_hint = false;
    let enable_jnt_comp = false;
    let enable_ref_frame_mvs = false;
    let seq_choose_screen_content_tools = false;
    let seq_force_screen_content_tools = _Av1.SelectScreenContentTools;
    let seq_choose_integer_mv = false;
    let seq_force_integer_mv = _Av1.SelectIntegerMv;
    let order_hint_bits_minus_1;
    if (!reduced_still_picture_header) {
      enable_interintra_compound = !!this.f1();
      enable_masked_compound = !!this.f1();
      enable_warped_motion = !!this.f1();
      enable_dual_filter = !!this.f1();
      enable_order_hint = !!this.f1();
      if (enable_order_hint) {
        enable_jnt_comp = !!this.f1();
        enable_ref_frame_mvs = !!this.f1();
      }
      seq_choose_screen_content_tools = !!this.f1();
      if (!seq_choose_screen_content_tools) {
        seq_force_screen_content_tools = this.f1();
      }
      if (seq_force_screen_content_tools > 0) {
        seq_choose_integer_mv = !!this.f1();
        if (!seq_choose_integer_mv) {
          seq_force_integer_mv = this.f1();
        }
      }
      if (enable_order_hint) {
        order_hint_bits_minus_1 = this.f(3);
      }
    }
    const enable_superres = !!this.f1();
    const enable_cdef = !!this.f1();
    const enable_restoration = !!this.f1();
    const color_config = this.colorConfig(seq_profile);
    const film_grain_params_present = !!this.f1();
    return {
      seq_profile,
      still_picture,
      reduced_still_picture_header,
      timing_info_present_flag,
      timing_info,
      decoder_model_info_present_flag,
      decoder_model_info,
      initial_display_delay_present_flag,
      initial_display_delay_minus_1,
      operating_points_cnt_minus_1,
      operating_point_idc,
      seq_level_idx,
      seq_tier,
      decoder_model_present_for_this_op,
      operating_parameters_info,
      initial_display_delay_present_for_this_op,
      frame_width_bits_minus_1,
      frame_height_bits_minus_1,
      max_frame_width_minus_1,
      max_frame_height_minus_1,
      frame_id_numbers_present_flag,
      delta_frame_id_length_minus_2,
      additional_frame_id_length_minus_1,
      use_128x128_superblock,
      enable_filter_intra,
      enable_intra_edge_filter,
      enable_interintra_compound,
      enable_masked_compound,
      enable_warped_motion,
      enable_dual_filter,
      enable_order_hint,
      enable_jnt_comp,
      enable_ref_frame_mvs,
      seq_choose_screen_content_tools,
      seq_force_screen_content_tools,
      seq_choose_integer_mv,
      seq_force_integer_mv,
      order_hint_bits_minus_1,
      enable_superres,
      enable_cdef,
      enable_restoration,
      color_config,
      film_grain_params_present
    };
  }
  searchSequenceHeaderObu() {
    while (!this.ended) {
      const obu = this.openBitstreamUnit();
      if (!obu) {
        continue;
      }
      if (obu.sequence_header_obu) {
        return obu.sequence_header_obu;
      }
    }
    return void 0;
  }
  timingInfo() {
    const num_units_in_display_tick = this.f(32);
    const time_scale = this.f(32);
    const equal_picture_interval = !!this.f1();
    let num_ticks_per_picture_minus_1;
    if (equal_picture_interval) {
      num_ticks_per_picture_minus_1 = this.uvlc();
    }
    return {
      num_units_in_display_tick,
      time_scale,
      equal_picture_interval,
      num_ticks_per_picture_minus_1
    };
  }
  decoderModelInfo() {
    const buffer_delay_length_minus_1 = this.f(5);
    const num_units_in_decoding_tick = this.f(32);
    const buffer_removal_time_length_minus_1 = this.f(5);
    const frame_presentation_time_length_minus_1 = this.f(5);
    return {
      buffer_delay_length_minus_1,
      num_units_in_decoding_tick,
      buffer_removal_time_length_minus_1,
      frame_presentation_time_length_minus_1
    };
  }
  operatingParametersInfo(decoderModelInfo) {
    const n = decoderModelInfo.buffer_delay_length_minus_1 + 1;
    const decoder_buffer_delay = this.f(n);
    const encoder_buffer_delay = this.f(n);
    const low_delay_mode_flag = !!this.f1();
    return {
      decoder_buffer_delay,
      encoder_buffer_delay,
      low_delay_mode_flag
    };
  }
  chooseOperatingPoint() {
    return 0;
  }
  colorConfig(seq_profile) {
    const high_bitdepth = !!this.f1();
    let twelve_bit = false;
    let BitDepth = 8;
    if (seq_profile === 2 && high_bitdepth) {
      twelve_bit = !!this.f1();
      BitDepth = twelve_bit ? 12 : 10;
    } else if (seq_profile <= 2) {
      BitDepth = high_bitdepth ? 10 : 8;
    }
    let mono_chrome = false;
    if (seq_profile === 1) {
      mono_chrome = !!this.f1();
    }
    const color_description_present_flag = !!this.f1();
    let color_primaries = _Av1.ColorPrimaries.Unspecified;
    let transfer_characteristics = _Av1.TransferCharacteristics.Unspecified;
    let matrix_coefficients = _Av1.MatrixCoefficients.Unspecified;
    if (color_description_present_flag) {
      color_primaries = this.f(8);
      transfer_characteristics = this.f(8);
      matrix_coefficients = this.f(8);
    }
    let color_range = false;
    let subsampling_x;
    let subsampling_y;
    let chroma_sample_position = 0;
    let separate_uv_delta_q = false;
    if (mono_chrome) {
      color_range = !!this.f1();
      subsampling_x = true;
      subsampling_y = true;
    } else {
      if (color_primaries === _Av1.ColorPrimaries.Bt709 && transfer_characteristics === _Av1.TransferCharacteristics.Srgb && matrix_coefficients === _Av1.MatrixCoefficients.Identity) {
        color_range = true;
        subsampling_x = false;
        subsampling_y = false;
      } else {
        color_range = !!this.f1();
        switch (seq_profile) {
          case 0:
            subsampling_x = true;
            subsampling_y = true;
            break;
          case 1:
            subsampling_x = false;
            subsampling_y = false;
            break;
          default:
            if (BitDepth == 12) {
              subsampling_x = !!this.f1();
              if (subsampling_x) {
                subsampling_y = !!this.f1();
              } else {
                subsampling_y = false;
              }
            } else {
              subsampling_x = true;
              subsampling_y = false;
            }
            break;
        }
        if (subsampling_x && subsampling_y) {
          chroma_sample_position = this.f(2);
        }
      }
      separate_uv_delta_q = !!this.f1();
    }
    return {
      high_bitdepth,
      twelve_bit,
      BitDepth,
      mono_chrome,
      color_description_present_flag,
      color_primaries,
      transfer_characteristics,
      matrix_coefficients,
      color_range,
      subsampling_x,
      subsampling_y,
      chroma_sample_position,
      separate_uv_delta_q
    };
  }
};

// node_modules/@yume-chan/scrcpy/esm/codec/nalu.js
function* annexBSplitNalu(buffer2) {
  let start = -1;
  let zeroCount = 0;
  let inEmulation = false;
  for (let i = 0; i < buffer2.length; i += 1) {
    const byte = buffer2[i];
    if (inEmulation) {
      if (byte > 3) {
        throw new Error("Invalid data");
      }
      inEmulation = false;
      continue;
    }
    if (byte === 0) {
      zeroCount += 1;
      continue;
    }
    const prevZeroCount = zeroCount;
    zeroCount = 0;
    if (start === -1) {
      if (prevZeroCount >= 2 && byte === 1) {
        start = i + 1;
        continue;
      }
      throw new Error("Invalid data");
    }
    if (prevZeroCount < 2) {
      continue;
    }
    if (byte === 1) {
      yield buffer2.subarray(start, i - prevZeroCount);
      start = i + 1;
      continue;
    }
    if (prevZeroCount > 2) {
      throw new Error("Invalid data");
    }
    switch (byte) {
      case 2:
        throw new Error("Invalid data");
      case 3:
        inEmulation = true;
        break;
      default:
        break;
    }
  }
  if (inEmulation) {
    throw new Error("Invalid data");
  }
  yield buffer2.subarray(start, buffer2.length);
}
var NaluSodbBitReader = class {
  #nalu;
  // logical length is `#byteLength * 8 + (7 - #stopBitIndex)`
  #byteLength;
  #stopBitIndex;
  #zeroCount = 0;
  // logical position is `#bytePosition * 8 + (7 - #bitPosition)`
  #bytePosition = 0;
  #bitPosition = 7;
  #byte = 0;
  get byteLength() {
    return this.#byteLength;
  }
  get stopBitIndex() {
    return this.#stopBitIndex;
  }
  get bytePosition() {
    return this.#bytePosition;
  }
  get bitPosition() {
    return this.#bitPosition;
  }
  get ended() {
    return this.#bytePosition >= this.#byteLength && this.#bitPosition <= this.#stopBitIndex;
  }
  constructor(nalu) {
    this.#nalu = nalu;
    for (let i = nalu.length - 1; i >= 0; i -= 1) {
      if (this.#nalu[i] === 0) {
        continue;
      }
      const byte = nalu[i];
      for (let j = 0; j < 8; j += 1) {
        if ((byte >> j & 1) === 1) {
          this.#byteLength = i;
          this.#stopBitIndex = j;
          this.#loadByte();
          return;
        }
      }
    }
    throw new Error("Stop bit not found");
  }
  #loadByte() {
    this.#byte = this.#nalu[this.#bytePosition];
    if (this.#zeroCount === 2 && this.#byte === 3) {
      this.#zeroCount = 0;
      this.#bytePosition += 1;
      this.#loadByte();
      return;
    }
    if (this.#byte === 0) {
      this.#zeroCount += 1;
    } else {
      this.#zeroCount = 0;
    }
  }
  next() {
    if (this.ended) {
      throw new Error("Bit index out of bounds");
    }
    const value = this.#byte >> this.#bitPosition & 1;
    this.#bitPosition -= 1;
    if (this.#bitPosition < 0) {
      this.#bytePosition += 1;
      this.#bitPosition = 7;
      this.#loadByte();
    }
    return value;
  }
  read(length) {
    if (length > 32) {
      throw new Error("Read length too large");
    }
    let result = 0;
    for (let i = 0; i < length; i += 1) {
      result = result << 1 | this.next();
    }
    return result;
  }
  /**
   * Throws an error if the current position is invalid for `skip`.
   *
   * Usually it will throw if `ended` is `true`,
   * except when the bit position is at the stop bit,
   * in which case `ended` will be `true`, but it won't throw.
   * `skip` can skip all remaining bits, and stop at the end position.
   * The next `next` call will throw since there is no more bits to read.
   */
  #checkSkipPosition() {
    if (this.#bytePosition >= this.#byteLength && this.#bitPosition < this.#stopBitIndex) {
      throw new Error("Bit index out of bounds");
    }
  }
  skip(length) {
    if (length <= this.#bitPosition + 1) {
      this.#bitPosition -= length;
      this.#checkSkipPosition();
      return;
    }
    length -= this.#bitPosition + 1;
    this.#bytePosition += 1;
    this.#bitPosition = 7;
    this.#loadByte();
    this.#checkSkipPosition();
    for (; length >= 8; length -= 8) {
      this.#bytePosition += 1;
      this.#loadByte();
      this.#checkSkipPosition();
    }
    this.#bitPosition = 7 - length;
    this.#checkSkipPosition();
  }
  decodeExponentialGolombNumber() {
    let length = 0;
    while (this.next() === 0) {
      length += 1;
    }
    if (length === 0) {
      return 0;
    }
    return (1 << length | this.read(length)) - 1;
  }
  #save() {
    return {
      zeroCount: this.#zeroCount,
      bytePosition: this.#bytePosition,
      bitPosition: this.#bitPosition,
      byte: this.#byte
    };
  }
  #restore(state) {
    this.#zeroCount = state.zeroCount;
    this.#bytePosition = state.bytePosition;
    this.#bitPosition = state.bitPosition;
    this.#byte = state.byte;
  }
  peek(length) {
    const state = this.#save();
    const result = this.read(length);
    this.#restore(state);
    return result;
  }
  readBytes(length) {
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i += 1) {
      result[i] = this.read(8);
    }
    return result;
  }
  peekBytes(length) {
    const state = this.#save();
    const result = this.readBytes(length);
    this.#restore(state);
    return result;
  }
};

// node_modules/@yume-chan/scrcpy/esm/codec/h264.js
var AndroidAvcProfile = {
  Baseline: 1 << 0,
  Main: 1 << 1,
  Extended: 1 << 2,
  High: 1 << 3,
  High10: 1 << 4,
  High422: 1 << 5,
  High444: 1 << 6,
  ConstrainedBaseline: 1 << 16,
  ConstrainedHigh: 1 << 19
};
var AndroidAvcLevel = {
  Level1: 1 << 0,
  Level1b: 1 << 1,
  Level11: 1 << 2,
  Level12: 1 << 3,
  Level13: 1 << 4,
  Level2: 1 << 5,
  Level21: 1 << 6,
  Level22: 1 << 7,
  Level3: 1 << 8,
  Level31: 1 << 9,
  Level32: 1 << 10,
  Level4: 1 << 11,
  Level41: 1 << 12,
  Level42: 1 << 13,
  Level5: 1 << 14,
  Level51: 1 << 15,
  Level52: 1 << 16,
  Level6: 1 << 17,
  Level61: 1 << 18,
  Level62: 1 << 19
};
function h264ParseSequenceParameterSet(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  if (reader.next() !== 0) {
    throw new Error("Invalid data");
  }
  const nal_ref_idc = reader.read(2);
  const nal_unit_type = reader.read(5);
  if (nal_unit_type !== 7) {
    throw new Error("Invalid data");
  }
  if (nal_ref_idc === 0) {
    throw new Error("Invalid data");
  }
  const profile_idc = reader.read(8);
  const constraint_set = reader.peek(8);
  const constraint_set0_flag = !!reader.next();
  const constraint_set1_flag = !!reader.next();
  const constraint_set2_flag = !!reader.next();
  const constraint_set3_flag = !!reader.next();
  const constraint_set4_flag = !!reader.next();
  const constraint_set5_flag = !!reader.next();
  if (reader.read(2) !== 0) {
    throw new Error("Invalid data");
  }
  const level_idc = reader.read(8);
  const seq_parameter_set_id = reader.decodeExponentialGolombNumber();
  if (profile_idc === 100 || profile_idc === 110 || profile_idc === 122 || profile_idc === 244 || profile_idc === 44 || profile_idc === 83 || profile_idc === 86 || profile_idc === 118 || profile_idc === 128 || profile_idc === 138 || profile_idc === 139 || profile_idc === 134) {
    const chroma_format_idc = reader.decodeExponentialGolombNumber();
    if (chroma_format_idc === 3) {
      reader.next();
    }
    reader.decodeExponentialGolombNumber();
    reader.decodeExponentialGolombNumber();
    reader.next();
    const seq_scaling_matrix_present_flag = !!reader.next();
    if (seq_scaling_matrix_present_flag) {
      const seq_scaling_list_present_flag = [];
      for (let i = 0; i < (chroma_format_idc !== 3 ? 8 : 12); i += 1) {
        seq_scaling_list_present_flag[i] = !!reader.next();
        if (seq_scaling_list_present_flag[i])
          if (i < 6) {
          } else {
          }
      }
    }
  }
  reader.decodeExponentialGolombNumber();
  const pic_order_cnt_type = reader.decodeExponentialGolombNumber();
  if (pic_order_cnt_type === 0) {
    reader.decodeExponentialGolombNumber();
  } else if (pic_order_cnt_type === 1) {
    reader.next();
    reader.decodeExponentialGolombNumber();
    reader.decodeExponentialGolombNumber();
    const num_ref_frames_in_pic_order_cnt_cycle = reader.decodeExponentialGolombNumber();
    const offset_for_ref_frame = [];
    for (let i = 0; i < num_ref_frames_in_pic_order_cnt_cycle; i += 1) {
      offset_for_ref_frame[i] = reader.decodeExponentialGolombNumber();
    }
  }
  reader.decodeExponentialGolombNumber();
  reader.next();
  const pic_width_in_mbs_minus1 = reader.decodeExponentialGolombNumber();
  const pic_height_in_map_units_minus1 = reader.decodeExponentialGolombNumber();
  const frame_mbs_only_flag = reader.next();
  if (!frame_mbs_only_flag) {
    reader.next();
  }
  reader.next();
  const frame_cropping_flag = !!reader.next();
  let frame_crop_left_offset;
  let frame_crop_right_offset;
  let frame_crop_top_offset;
  let frame_crop_bottom_offset;
  if (frame_cropping_flag) {
    frame_crop_left_offset = reader.decodeExponentialGolombNumber();
    frame_crop_right_offset = reader.decodeExponentialGolombNumber();
    frame_crop_top_offset = reader.decodeExponentialGolombNumber();
    frame_crop_bottom_offset = reader.decodeExponentialGolombNumber();
  } else {
    frame_crop_left_offset = 0;
    frame_crop_right_offset = 0;
    frame_crop_top_offset = 0;
    frame_crop_bottom_offset = 0;
  }
  const vui_parameters_present_flag = !!reader.next();
  if (vui_parameters_present_flag) {
  }
  return {
    profile_idc,
    constraint_set,
    constraint_set0_flag,
    constraint_set1_flag,
    constraint_set2_flag,
    constraint_set3_flag,
    constraint_set4_flag,
    constraint_set5_flag,
    level_idc,
    seq_parameter_set_id,
    pic_width_in_mbs_minus1,
    pic_height_in_map_units_minus1,
    frame_mbs_only_flag,
    frame_cropping_flag,
    frame_crop_left_offset,
    frame_crop_right_offset,
    frame_crop_top_offset,
    frame_crop_bottom_offset
  };
}
function h264SearchConfiguration(buffer2) {
  let sequenceParameterSet;
  let pictureParameterSet;
  for (const nalu of annexBSplitNalu(buffer2)) {
    const naluType = nalu[0] & 31;
    switch (naluType) {
      case 7:
        sequenceParameterSet = nalu;
        if (pictureParameterSet) {
          return {
            sequenceParameterSet,
            pictureParameterSet
          };
        }
        break;
      case 8:
        pictureParameterSet = nalu;
        if (sequenceParameterSet) {
          return {
            sequenceParameterSet,
            pictureParameterSet
          };
        }
        break;
      default:
        break;
    }
  }
  throw new Error("Invalid data");
}
function h264ParseConfiguration(data) {
  const { sequenceParameterSet, pictureParameterSet } = h264SearchConfiguration(data);
  const { profile_idc: profileIndex, constraint_set: constraintSet, level_idc: levelIndex, pic_width_in_mbs_minus1, pic_height_in_map_units_minus1, frame_mbs_only_flag, frame_crop_left_offset, frame_crop_right_offset, frame_crop_top_offset, frame_crop_bottom_offset } = h264ParseSequenceParameterSet(sequenceParameterSet);
  const encodedWidth = (pic_width_in_mbs_minus1 + 1) * 16;
  const encodedHeight = (pic_height_in_map_units_minus1 + 1) * (2 - frame_mbs_only_flag) * 16;
  const cropLeft = frame_crop_left_offset * 2;
  const cropRight = frame_crop_right_offset * 2;
  const cropTop = frame_crop_top_offset * 2;
  const cropBottom = frame_crop_bottom_offset * 2;
  const croppedWidth = encodedWidth - cropLeft - cropRight;
  const croppedHeight = encodedHeight - cropTop - cropBottom;
  return {
    pictureParameterSet,
    sequenceParameterSet,
    profileIndex,
    constraintSet,
    levelIndex,
    encodedWidth,
    encodedHeight,
    cropLeft,
    cropRight,
    cropTop,
    cropBottom,
    croppedWidth,
    croppedHeight
  };
}

// node_modules/@yume-chan/scrcpy/esm/codec/h265.js
var AndroidHevcProfile = {
  Main: 1 << 0,
  Main10: 1 << 1,
  MainStill: 1 << 2,
  Main10Hdr10: 1 << 12,
  Main10Hdr10Plus: 1 << 13
};
var AndroidHevcLevel = {
  MainTierLevel1: 1 << 0,
  HighTierLevel1: 1 << 1,
  MainTierLevel2: 1 << 2,
  HighTierLevel2: 1 << 3,
  MainTierLevel21: 1 << 4,
  HighTierLevel21: 1 << 5,
  MainTierLevel3: 1 << 6,
  HighTierLevel3: 1 << 7,
  MainTierLevel31: 1 << 8,
  HighTierLevel31: 1 << 9,
  MainTierLevel4: 1 << 10,
  HighTierLevel4: 1 << 11,
  MainTierLevel41: 1 << 12,
  HighTierLevel41: 1 << 13,
  MainTierLevel5: 1 << 14,
  HighTierLevel5: 1 << 15,
  MainTierLevel51: 1 << 16,
  HighTierLevel51: 1 << 17,
  MainTierLevel52: 1 << 18,
  HighTierLevel52: 1 << 19,
  MainTierLevel6: 1 << 20,
  HighTierLevel6: 1 << 21,
  MainTierLevel61: 1 << 22,
  HighTierLevel61: 1 << 23,
  MainTierLevel62: 1 << 24,
  HighTierLevel62: 1 << 25
};
function getSubWidthC(chroma_format_idc) {
  switch (chroma_format_idc) {
    case 0:
    case 3:
      return 1;
    case 1:
    case 2:
      return 2;
    default:
      throw new Error("Invalid chroma_format_idc");
  }
}
function getSubHeightC(chroma_format_idc) {
  switch (chroma_format_idc) {
    case 0:
    case 2:
    case 3:
      return 1;
    case 1:
      return 2;
    default:
      throw new Error("Invalid chroma_format_idc");
  }
}
function h265ParseNaluHeader(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  if (reader.next() !== 0) {
    throw new Error("Invalid NALU header");
  }
  const nal_unit_type = reader.read(6);
  const nuh_layer_id = reader.read(6);
  const nuh_temporal_id_plus1 = reader.read(3);
  return {
    nal_unit_type,
    nuh_layer_id,
    nuh_temporal_id_plus1
  };
}
function h265ParseVideoParameterSet(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  const vps_video_parameter_set_id = reader.read(4);
  const vps_base_layer_internal_flag = !!reader.next();
  const vps_base_layer_available_flag = !!reader.next();
  const vps_max_layers_minus1 = reader.read(6);
  const vps_max_sub_layers_minus1 = reader.read(3);
  const vps_temporal_id_nesting_flag = !!reader.next();
  reader.skip(16);
  const profileTierLevel = h265ParseProfileTierLevel(reader, true, vps_max_sub_layers_minus1);
  const vps_sub_layer_ordering_info_present_flag = !!reader.next();
  const vps_max_dec_pic_buffering_minus1 = [];
  const vps_max_num_reorder_pics = [];
  const vps_max_latency_increase_plus1 = [];
  for (let i = vps_sub_layer_ordering_info_present_flag ? 0 : vps_max_sub_layers_minus1; i <= vps_max_sub_layers_minus1; i += 1) {
    vps_max_dec_pic_buffering_minus1[i] = reader.decodeExponentialGolombNumber();
    vps_max_num_reorder_pics[i] = reader.decodeExponentialGolombNumber();
    vps_max_latency_increase_plus1[i] = reader.decodeExponentialGolombNumber();
  }
  const vps_max_layer_id = reader.read(6);
  const vps_num_layer_sets_minus1 = reader.decodeExponentialGolombNumber();
  const layer_id_included_flag = [];
  for (let i = 1; i <= vps_num_layer_sets_minus1; i += 1) {
    layer_id_included_flag[i] = [];
    for (let j = 0; j <= vps_max_layer_id; j += 1) {
      layer_id_included_flag[i][j] = !!reader.next();
    }
  }
  const vps_timing_info_present_flag = !!reader.next();
  let vps_num_units_in_tick;
  let vps_time_scale;
  let vps_poc_proportional_to_timing_flag;
  let vps_num_ticks_poc_diff_one_minus1;
  let vps_num_hrd_parameters;
  let hrd_layer_set_idx;
  let cprms_present_flag;
  let hrdParameters;
  if (vps_timing_info_present_flag) {
    vps_num_units_in_tick = reader.read(32);
    vps_time_scale = reader.read(32);
    vps_poc_proportional_to_timing_flag = !!reader.next();
    if (vps_poc_proportional_to_timing_flag) {
      vps_num_ticks_poc_diff_one_minus1 = reader.decodeExponentialGolombNumber();
    }
    vps_num_hrd_parameters = reader.decodeExponentialGolombNumber();
    hrd_layer_set_idx = [];
    cprms_present_flag = [true];
    hrdParameters = [];
    for (let i = 0; i < vps_num_hrd_parameters; i += 1) {
      hrd_layer_set_idx[i] = reader.decodeExponentialGolombNumber();
      if (i > 0) {
        cprms_present_flag[i] = !!reader.next();
      }
      hrdParameters[i] = h265ParseHrdParameters(reader, cprms_present_flag[i], vps_max_sub_layers_minus1);
    }
  }
  const vps_extension_flag = !!reader.next();
  return {
    vps_video_parameter_set_id,
    vps_base_layer_internal_flag,
    vps_base_layer_available_flag,
    vps_max_layers_minus1,
    vps_max_sub_layers_minus1,
    vps_temporal_id_nesting_flag,
    profileTierLevel,
    vps_sub_layer_ordering_info_present_flag,
    vps_max_dec_pic_buffering_minus1,
    vps_max_num_reorder_pics,
    vps_max_latency_increase_plus1,
    vps_max_layer_id,
    vps_num_layer_sets_minus1,
    layer_id_included_flag,
    vps_timing_info_present_flag,
    vps_num_units_in_tick,
    vps_time_scale,
    vps_poc_proportional_to_timing_flag,
    vps_num_ticks_poc_diff_one_minus1,
    vps_num_hrd_parameters,
    hrd_layer_set_idx,
    cprms_present_flag,
    hrdParameters,
    vps_extension_flag
  };
}
function h265ParseSequenceParameterSet(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  const sps_video_parameter_set_id = reader.read(4);
  const sps_max_sub_layers_minus1 = reader.read(3);
  const sps_temporal_id_nesting_flag = !!reader.next();
  const profileTierLevel = h265ParseProfileTierLevel(reader, true, sps_max_sub_layers_minus1);
  const sps_seq_parameter_set_id = reader.decodeExponentialGolombNumber();
  const chroma_format_idc = reader.decodeExponentialGolombNumber();
  let separate_colour_plane_flag;
  if (chroma_format_idc === 3) {
    separate_colour_plane_flag = !!reader.next();
  }
  const pic_width_in_luma_samples = reader.decodeExponentialGolombNumber();
  const pic_height_in_luma_samples = reader.decodeExponentialGolombNumber();
  const conformance_window_flag = !!reader.next();
  let conf_win_left_offset;
  let conf_win_right_offset;
  let conf_win_top_offset;
  let conf_win_bottom_offset;
  if (conformance_window_flag) {
    conf_win_left_offset = reader.decodeExponentialGolombNumber();
    conf_win_right_offset = reader.decodeExponentialGolombNumber();
    conf_win_top_offset = reader.decodeExponentialGolombNumber();
    conf_win_bottom_offset = reader.decodeExponentialGolombNumber();
  }
  const bit_depth_luma_minus8 = reader.decodeExponentialGolombNumber();
  const bit_depth_chroma_minus8 = reader.decodeExponentialGolombNumber();
  const log2_max_pic_order_cnt_lsb_minus4 = reader.decodeExponentialGolombNumber();
  const sps_max_dec_pic_buffering_minus1 = [];
  const sps_max_num_reorder_pics = [];
  const sps_max_latency_increase_plus1 = [];
  const sps_sub_layer_ordering_info_present_flag = !!reader.next();
  for (let i = sps_sub_layer_ordering_info_present_flag ? 0 : sps_max_sub_layers_minus1; i <= sps_max_sub_layers_minus1; i += 1) {
    sps_max_dec_pic_buffering_minus1[i] = reader.decodeExponentialGolombNumber();
    sps_max_num_reorder_pics[i] = reader.decodeExponentialGolombNumber();
    sps_max_latency_increase_plus1[i] = reader.decodeExponentialGolombNumber();
  }
  const log2_min_luma_coding_block_size_minus3 = reader.decodeExponentialGolombNumber();
  const log2_diff_max_min_luma_coding_block_size = reader.decodeExponentialGolombNumber();
  const log2_min_luma_transform_block_size_minus2 = reader.decodeExponentialGolombNumber();
  const log2_diff_max_min_luma_transform_block_size = reader.decodeExponentialGolombNumber();
  const max_transform_hierarchy_depth_inter = reader.decodeExponentialGolombNumber();
  const max_transform_hierarchy_depth_intra = reader.decodeExponentialGolombNumber();
  const scaling_list_enabled_flag = !!reader.next();
  let sps_scaling_list_data_present_flag;
  let scalingListData;
  if (scaling_list_enabled_flag) {
    sps_scaling_list_data_present_flag = !!reader.next();
    if (sps_scaling_list_data_present_flag) {
      scalingListData = h265ParseScalingListData(reader);
    }
  }
  const amp_enabled_flag = !!reader.next();
  const sample_adaptive_offset_enabled_flag = !!reader.next();
  const pcm_enabled_flag = !!reader.next();
  let pcm_sample_bit_depth_luma_minus1;
  let pcm_sample_bit_depth_chroma_minus1;
  let log2_min_pcm_luma_coding_block_size_minus3;
  let log2_diff_max_min_pcm_luma_coding_block_size;
  let pcm_loop_filter_disabled_flag;
  if (pcm_enabled_flag) {
    pcm_sample_bit_depth_luma_minus1 = reader.read(4);
    pcm_sample_bit_depth_chroma_minus1 = reader.read(4);
    log2_min_pcm_luma_coding_block_size_minus3 = reader.decodeExponentialGolombNumber();
    log2_diff_max_min_pcm_luma_coding_block_size = reader.decodeExponentialGolombNumber();
    pcm_loop_filter_disabled_flag = !!reader.next();
  }
  const num_short_term_ref_pic_sets = reader.decodeExponentialGolombNumber();
  const shortTermRefPicSets = [];
  for (let i = 0; i < num_short_term_ref_pic_sets; i += 1) {
    shortTermRefPicSets[i] = h265ParseShortTermReferencePictureSet(reader, i, num_short_term_ref_pic_sets, shortTermRefPicSets);
  }
  const long_term_ref_pics_present_flag = !!reader.next();
  let num_long_term_ref_pics_sps;
  let lt_ref_pic_poc_lsb_sps;
  let used_by_curr_pic_lt_sps_flag;
  if (long_term_ref_pics_present_flag) {
    num_long_term_ref_pics_sps = reader.decodeExponentialGolombNumber();
    lt_ref_pic_poc_lsb_sps = [];
    used_by_curr_pic_lt_sps_flag = [];
    for (let i = 0; i < num_long_term_ref_pics_sps; i += 1) {
      lt_ref_pic_poc_lsb_sps[i] = reader.read(log2_max_pic_order_cnt_lsb_minus4 + 4);
      used_by_curr_pic_lt_sps_flag[i] = !!reader.next();
    }
  }
  const sps_temporal_mvp_enabled_flag = !!reader.next();
  const strong_intra_smoothing_enabled_flag = !!reader.next();
  const vui_parameters_present_flag = !!reader.next();
  let vuiParameters;
  if (vui_parameters_present_flag) {
    vuiParameters = h265ParseVuiParameters(reader, sps_max_sub_layers_minus1);
  }
  const sps_extension_present_flag = !!reader.next();
  let sps_range_extension_flag;
  let sps_multilayer_extension_flag;
  let sps_3d_extension_flag;
  let sps_scc_extension_flag;
  let sps_extension_4bits;
  if (sps_extension_present_flag) {
    sps_range_extension_flag = !!reader.next();
    sps_multilayer_extension_flag = !!reader.next();
    sps_3d_extension_flag = !!reader.next();
    sps_scc_extension_flag = !!reader.next();
    sps_extension_4bits = reader.read(4);
  }
  if (sps_range_extension_flag) {
    throw new Error("Not implemented");
  }
  let spsMultilayerExtension;
  if (sps_multilayer_extension_flag) {
    spsMultilayerExtension = h265ParseSpsMultilayerExtension(reader);
  }
  let sps3dExtension;
  if (sps_3d_extension_flag) {
    sps3dExtension = h265ParseSps3dExtension(reader);
  }
  if (sps_scc_extension_flag) {
    throw new Error("Not implemented");
  }
  let sps_extension_data_flag;
  if (sps_extension_4bits) {
    sps_extension_data_flag = [];
    let i = 0;
    while (!reader.ended) {
      sps_extension_data_flag[i] = !!reader.next();
      i += 1;
    }
  }
  return {
    sps_video_parameter_set_id,
    sps_max_sub_layers_minus1,
    sps_temporal_id_nesting_flag,
    profileTierLevel,
    sps_seq_parameter_set_id,
    chroma_format_idc,
    separate_colour_plane_flag,
    pic_width_in_luma_samples,
    pic_height_in_luma_samples,
    conformance_window_flag,
    conf_win_left_offset,
    conf_win_right_offset,
    conf_win_top_offset,
    conf_win_bottom_offset,
    bit_depth_luma_minus8,
    bit_depth_chroma_minus8,
    log2_max_pic_order_cnt_lsb_minus4,
    sps_sub_layer_ordering_info_present_flag,
    sps_max_dec_pic_buffering_minus1,
    sps_max_num_reorder_pics,
    sps_max_latency_increase_plus1,
    log2_min_luma_coding_block_size_minus3,
    log2_diff_max_min_luma_coding_block_size,
    log2_min_luma_transform_block_size_minus2,
    log2_diff_max_min_luma_transform_block_size,
    max_transform_hierarchy_depth_inter,
    max_transform_hierarchy_depth_intra,
    scaling_list_enabled_flag,
    sps_scaling_list_data_present_flag,
    scalingListData,
    amp_enabled_flag,
    sample_adaptive_offset_enabled_flag,
    pcm_enabled_flag,
    pcm_sample_bit_depth_luma_minus1,
    pcm_sample_bit_depth_chroma_minus1,
    log2_min_pcm_luma_coding_block_size_minus3,
    log2_diff_max_min_pcm_luma_coding_block_size,
    pcm_loop_filter_disabled_flag,
    num_short_term_ref_pic_sets,
    shortTermRefPicSets,
    long_term_ref_pics_present_flag,
    num_long_term_ref_pics_sps,
    lt_ref_pic_poc_lsb_sps,
    used_by_curr_pic_lt_sps_flag,
    sps_temporal_mvp_enabled_flag,
    strong_intra_smoothing_enabled_flag,
    vui_parameters_present_flag,
    vuiParameters,
    sps_extension_present_flag,
    sps_range_extension_flag,
    sps_multilayer_extension_flag,
    sps_3d_extension_flag,
    sps_scc_extension_flag,
    sps_extension_4bits,
    spsMultilayerExtension,
    sps3dExtension,
    sps_extension_data_flag
  };
}
function h265ParseProfileTier(reader) {
  const profile_space = reader.read(2);
  const tier_flag = !!reader.next();
  const profile_idc = reader.read(5);
  const profileCompatibilitySet = reader.peekBytes(4);
  const profile_compatibility_flag = [];
  for (let j = 0; j < 32; j += 1) {
    profile_compatibility_flag[j] = !!reader.next();
  }
  const constraintSet = reader.peekBytes(6);
  const progressive_source_flag = !!reader.next();
  const interlaced_source_flag = !!reader.next();
  const non_packed_constraint_flag = !!reader.next();
  const frame_only_constraint_flag = !!reader.next();
  let max_12bit_constraint_flag;
  let max_10bit_constraint_flag;
  let max_8bit_constraint_flag;
  let max_422chroma_constraint_flag;
  let max_420chroma_constraint_flag;
  let max_monochrome_constraint_flag;
  let intra_constraint_flag;
  let one_picture_only_constraint_flag;
  let lower_bit_rate_constraint_flag;
  let max_14bit_constraint_flag;
  if (profile_idc === 4 || profile_compatibility_flag[4] || profile_idc === 5 || profile_compatibility_flag[5] || profile_idc === 6 || profile_compatibility_flag[6] || profile_idc === 7 || profile_compatibility_flag[7] || profile_idc === 8 || profile_compatibility_flag[8] || profile_idc === 9 || profile_compatibility_flag[9] || profile_idc === 10 || profile_compatibility_flag[10] || profile_idc === 11 || profile_compatibility_flag[11]) {
    max_12bit_constraint_flag = !!reader.next();
    max_10bit_constraint_flag = !!reader.next();
    max_8bit_constraint_flag = !!reader.next();
    max_422chroma_constraint_flag = !!reader.next();
    max_420chroma_constraint_flag = !!reader.next();
    max_monochrome_constraint_flag = !!reader.next();
    intra_constraint_flag = !!reader.next();
    one_picture_only_constraint_flag = !!reader.next();
    lower_bit_rate_constraint_flag = !!reader.next();
    if (profile_idc === 5 || profile_compatibility_flag[5] || profile_idc === 9 || profile_compatibility_flag[9] || profile_idc === 10 || profile_compatibility_flag[10] || profile_idc === 11 || profile_compatibility_flag[11]) {
      max_14bit_constraint_flag = !!reader.next();
      reader.skip(33);
    } else {
      reader.skip(34);
    }
  } else if (profile_idc === 2 || profile_compatibility_flag[2]) {
    reader.skip(7);
    one_picture_only_constraint_flag = !!reader.next();
    reader.skip(35);
  } else {
    reader.skip(43);
  }
  let inbld_flag;
  if (profile_idc === 1 || profile_compatibility_flag[1] || profile_idc === 2 || profile_compatibility_flag[2] || profile_idc === 3 || profile_compatibility_flag[3] || profile_idc === 4 || profile_compatibility_flag[4] || profile_idc === 5 || profile_compatibility_flag[5] || profile_idc === 9 || profile_compatibility_flag[9] || profile_idc === 11 || profile_compatibility_flag[11]) {
    inbld_flag = !!reader.next();
  } else {
    reader.skip(1);
  }
  return {
    profile_space,
    tier_flag,
    profile_idc,
    profileCompatibilitySet,
    profile_compatibility_flag,
    constraintSet,
    progressive_source_flag,
    interlaced_source_flag,
    non_packed_constraint_flag,
    frame_only_constraint_flag,
    max_12bit_constraint_flag,
    max_10bit_constraint_flag,
    max_8bit_constraint_flag,
    max_422chroma_constraint_flag,
    max_420chroma_constraint_flag,
    max_monochrome_constraint_flag,
    intra_constraint_flag,
    one_picture_only_constraint_flag,
    lower_bit_rate_constraint_flag,
    max_14bit_constraint_flag,
    inbld_flag
  };
}
function h265ParseProfileTierLevel(reader, profilePresentFlag, maxNumSubLayersMinus1) {
  let generalProfileTier;
  if (profilePresentFlag) {
    generalProfileTier = h265ParseProfileTier(reader);
  }
  const general_level_idc = reader.read(8);
  const sub_layer_profile_present_flag = [];
  const sub_layer_level_present_flag = [];
  for (let i = 0; i < maxNumSubLayersMinus1; i += 1) {
    sub_layer_profile_present_flag[i] = !!reader.next();
    sub_layer_level_present_flag[i] = !!reader.next();
  }
  if (maxNumSubLayersMinus1 > 0) {
    for (let i = maxNumSubLayersMinus1; i < 8; i += 1) {
      reader.read(2);
    }
  }
  const subLayerProfileTier = [];
  const sub_layer_level_idc = [];
  for (let i = 0; i < maxNumSubLayersMinus1; i += 1) {
    if (sub_layer_profile_present_flag[i]) {
      subLayerProfileTier[i] = h265ParseProfileTier(reader);
    }
    if (sub_layer_level_present_flag[i]) {
      sub_layer_level_idc[i] = reader.read(8);
    }
  }
  return {
    generalProfileTier,
    general_level_idc,
    sub_layer_profile_present_flag,
    sub_layer_level_present_flag,
    subLayerProfileTier,
    sub_layer_level_idc
  };
}
function h265ParseScalingListData(reader) {
  const scaling_list = [];
  for (let sizeId = 0; sizeId < 4; sizeId += 1) {
    scaling_list[sizeId] = [];
    for (let matrixId = 0; matrixId < 6; matrixId += sizeId === 3 ? 3 : 1) {
      const scaling_list_pred_mode_flag = !!reader.next();
      if (!scaling_list_pred_mode_flag) {
        reader.decodeExponentialGolombNumber();
      } else {
        let nextCoef = 8;
        const coefNum = Math.min(64, 1 << 4 + (sizeId << 1));
        if (sizeId > 1) {
          const scaling_list_dc_coef_minus8 = reader.decodeExponentialGolombNumber();
          nextCoef = scaling_list_dc_coef_minus8 + 8;
        }
        scaling_list[sizeId][matrixId] = [];
        for (let i = 0; i < coefNum; i += 1) {
          const scaling_list_delta_coef = reader.decodeExponentialGolombNumber();
          nextCoef = (nextCoef + scaling_list_delta_coef + 256) % 256;
          scaling_list[sizeId][matrixId][i] = nextCoef;
        }
      }
    }
  }
  return scaling_list;
}
function h265ParseShortTermReferencePictureSet(reader, stRpsIdx, num_short_term_ref_pic_sets, sets) {
  let inter_ref_pic_set_prediction_flag = false;
  if (stRpsIdx !== 0) {
    inter_ref_pic_set_prediction_flag = !!reader.next();
  }
  let delta_idx_minus1 = 0;
  let delta_rps_sign = false;
  let abs_delta_rps_minus1 = 0;
  const used_by_curr_pic_flag = [];
  const use_delta_flag = [];
  let num_negative_pics = 0;
  let num_positive_pics = 0;
  const delta_poc_s0_minus1 = [];
  const used_by_curr_pic_s0_flag = [];
  const delta_poc_s1_minus1 = [];
  const used_by_curr_pic_s1_flag = [];
  if (inter_ref_pic_set_prediction_flag) {
    if (stRpsIdx === num_short_term_ref_pic_sets) {
      delta_idx_minus1 = reader.decodeExponentialGolombNumber();
    }
    delta_rps_sign = !!reader.next();
    abs_delta_rps_minus1 = reader.decodeExponentialGolombNumber();
    const RefRpsIdx = stRpsIdx - (delta_idx_minus1 + 1);
    const RefRps = sets[RefRpsIdx];
    const NumDeltaPocs_RefRpsIdx = RefRps.num_negative_pics + RefRps.num_positive_pics;
    for (let j = 0; j <= NumDeltaPocs_RefRpsIdx; j += 1) {
      used_by_curr_pic_flag[j] = !!reader.next();
      if (!used_by_curr_pic_flag[j]) {
        use_delta_flag[j] = !!reader.next();
      } else {
        use_delta_flag[j] = true;
      }
    }
    const DeltaRps = (1 - 2 * Number(delta_rps_sign)) * (abs_delta_rps_minus1 + 1);
    const RefPocS0 = [];
    const RefPocS1 = [];
    const pocS0 = [];
    const pocS1 = [];
    let dPoc = 0;
    for (let i2 = 0; i2 < RefRps.num_negative_pics; i2 += 1) {
      dPoc -= RefRps.delta_poc_s0_minus1[i2] + 1;
      RefPocS0[i2] = dPoc;
    }
    dPoc = 0;
    for (let i2 = 0; i2 < RefRps.num_positive_pics; i2 += 1) {
      dPoc += RefRps.delta_poc_s1_minus1[i2] + 1;
      RefPocS1[i2] = dPoc;
    }
    let i = 0;
    if (RefRps.num_positive_pics > 0) {
      for (let j = RefRps.num_positive_pics - 1; j >= 0; j -= 1) {
        dPoc = RefPocS1[j] + DeltaRps;
        if (dPoc < 0 && use_delta_flag[RefRps.num_negative_pics + j]) {
          pocS0[i] = dPoc;
          used_by_curr_pic_s0_flag[i] = used_by_curr_pic_flag[RefRps.num_negative_pics + j];
          i += 1;
        }
      }
    }
    if (DeltaRps < 0 && use_delta_flag[NumDeltaPocs_RefRpsIdx]) {
      pocS0[i] = DeltaRps;
      used_by_curr_pic_s0_flag[i] = used_by_curr_pic_flag[NumDeltaPocs_RefRpsIdx];
      i += 1;
    }
    for (let j = 0; j < RefRps.num_negative_pics; j += 1) {
      dPoc = RefPocS0[j] + DeltaRps;
      if (dPoc < 0 && use_delta_flag[j]) {
        pocS0[i] = dPoc;
        used_by_curr_pic_s0_flag[i] = used_by_curr_pic_flag[j];
        i += 1;
      }
    }
    num_negative_pics = i;
    let prev = 0;
    for (i = 0; i < num_negative_pics; i += 1) {
      const current = pocS0[i];
      delta_poc_s0_minus1[i] = -(current - prev - 1);
      prev = current;
    }
    i = 0;
    if (RefRps.num_negative_pics > 0) {
      for (let j = RefRps.num_negative_pics - 1; j >= 0; j -= 1) {
        dPoc = RefPocS0[j] + DeltaRps;
        if (dPoc > 0 && use_delta_flag[j]) {
          pocS1[i] = dPoc;
          used_by_curr_pic_s1_flag[i] = used_by_curr_pic_flag[j];
          i += 1;
        }
      }
    }
    if (DeltaRps > 0 && use_delta_flag[NumDeltaPocs_RefRpsIdx]) {
      pocS1[i] = DeltaRps;
      used_by_curr_pic_s1_flag[i] = used_by_curr_pic_flag[NumDeltaPocs_RefRpsIdx];
      i += 1;
    }
    for (let j = 0; j < RefRps.num_positive_pics; j += 1) {
      dPoc = RefPocS1[j] + DeltaRps;
      if (dPoc > 0 && use_delta_flag[RefRps.num_negative_pics + j]) {
        pocS1[i] = dPoc;
        used_by_curr_pic_s1_flag[i] = used_by_curr_pic_flag[RefRps.num_negative_pics + j];
        i += 1;
      }
    }
    num_positive_pics = i;
    prev = 0;
    for (i = 0; i < num_positive_pics; i += 1) {
      const current = pocS1[i];
      delta_poc_s1_minus1[i] = current - prev - 1;
      prev = current;
    }
  } else {
    num_negative_pics = reader.decodeExponentialGolombNumber();
    num_positive_pics = reader.decodeExponentialGolombNumber();
    for (let i = 0; i < num_negative_pics; i += 1) {
      delta_poc_s0_minus1[i] = reader.decodeExponentialGolombNumber();
      used_by_curr_pic_s0_flag[i] = !!reader.next();
    }
    for (let i = 0; i < num_positive_pics; i += 1) {
      delta_poc_s1_minus1[i] = reader.decodeExponentialGolombNumber();
      used_by_curr_pic_s1_flag[i] = !!reader.next();
    }
  }
  return {
    stRpsIdx,
    num_short_term_ref_pic_sets,
    inter_ref_pic_set_prediction_flag,
    delta_idx_minus1,
    delta_rps_sign,
    abs_delta_rps_minus1,
    used_by_curr_pic_flag,
    use_delta_flag,
    num_negative_pics,
    num_positive_pics,
    delta_poc_s0_minus1,
    used_by_curr_pic_s0_flag,
    delta_poc_s1_minus1,
    used_by_curr_pic_s1_flag
  };
}
var H265AspectRatioIndicator = {
  Unspecified: 0,
  Square: 1,
  _12_11: 2,
  _10_11: 3,
  _16_11: 4,
  _40_33: 5,
  _24_11: 6,
  _20_11: 7,
  _32_11: 8,
  _80_33: 9,
  _18_11: 10,
  _15_11: 11,
  _64_33: 12,
  _160_99: 13,
  _4_3: 15,
  _3_2: 16,
  _2_1: 17,
  Extended: 255
};
function h265ParseVuiParameters(reader, sps_max_sub_layers_minus1) {
  const aspect_ratio_info_present_flag = !!reader.next();
  let aspect_ratio_idc;
  let sar_width;
  let sar_height;
  if (aspect_ratio_info_present_flag) {
    aspect_ratio_idc = reader.read(8);
    if (aspect_ratio_idc === H265AspectRatioIndicator.Extended) {
      sar_width = reader.read(16);
      sar_height = reader.read(16);
    }
  }
  const overscan_info_present_flag = !!reader.next();
  let overscan_appropriate_flag;
  if (overscan_info_present_flag) {
    overscan_appropriate_flag = !!reader.next();
  }
  const video_signal_type_present_flag = !!reader.next();
  let video_format;
  let video_full_range_flag;
  let colour_description_present_flag;
  let colour_primaries;
  let transfer_characteristics;
  let matrix_coeffs;
  if (video_signal_type_present_flag) {
    video_format = reader.read(3);
    video_full_range_flag = !!reader.next();
    colour_description_present_flag = !!reader.next();
    if (colour_description_present_flag) {
      colour_primaries = reader.read(8);
      transfer_characteristics = reader.read(8);
      matrix_coeffs = reader.read(8);
    }
  }
  const chroma_loc_info_present_flag = !!reader.next();
  let chroma_sample_loc_type_top_field;
  let chroma_sample_loc_type_bottom_field;
  if (chroma_loc_info_present_flag) {
    chroma_sample_loc_type_top_field = reader.decodeExponentialGolombNumber();
    chroma_sample_loc_type_bottom_field = reader.decodeExponentialGolombNumber();
  }
  const neutral_chroma_indication_flag = !!reader.next();
  const field_seq_flag = !!reader.next();
  const frame_field_info_present_flag = !!reader.next();
  const default_display_window_flag = !!reader.next();
  let def_disp_win_left_offset;
  let def_disp_win_right_offset;
  let def_disp_win_top_offset;
  let def_disp_win_bottom_offset;
  if (default_display_window_flag) {
    def_disp_win_left_offset = reader.decodeExponentialGolombNumber();
    def_disp_win_right_offset = reader.decodeExponentialGolombNumber();
    def_disp_win_top_offset = reader.decodeExponentialGolombNumber();
    def_disp_win_bottom_offset = reader.decodeExponentialGolombNumber();
  }
  const vui_timing_info_present_flag = !!reader.next();
  let vui_num_units_in_tick;
  let vui_time_scale;
  let vui_poc_proportional_to_timing_flag;
  let vui_num_ticks_poc_diff_one_minus1;
  let vui_hrd_parameters_present_flag;
  let vui_hrd_parameters;
  if (vui_timing_info_present_flag) {
    vui_num_units_in_tick = reader.read(32);
    vui_time_scale = reader.read(32);
    vui_poc_proportional_to_timing_flag = !!reader.next();
    if (vui_poc_proportional_to_timing_flag) {
      vui_num_ticks_poc_diff_one_minus1 = reader.decodeExponentialGolombNumber();
    }
    vui_hrd_parameters_present_flag = !!reader.next();
    if (vui_hrd_parameters_present_flag) {
      vui_hrd_parameters = h265ParseHrdParameters(reader, true, sps_max_sub_layers_minus1);
    }
  }
  const bitstream_restriction_flag = !!reader.next();
  let tiles_fixed_structure_flag;
  let motion_vectors_over_pic_boundaries_flag;
  let restricted_ref_pic_lists_flag;
  let min_spatial_segmentation_idc;
  let max_bytes_per_pic_denom;
  let max_bits_per_min_cu_denom;
  let log2_max_mv_length_horizontal;
  let log2_max_mv_length_vertical;
  if (bitstream_restriction_flag) {
    tiles_fixed_structure_flag = !!reader.next();
    motion_vectors_over_pic_boundaries_flag = !!reader.next();
    restricted_ref_pic_lists_flag = !!reader.next();
    min_spatial_segmentation_idc = reader.decodeExponentialGolombNumber();
    max_bytes_per_pic_denom = reader.decodeExponentialGolombNumber();
    max_bits_per_min_cu_denom = reader.decodeExponentialGolombNumber();
    log2_max_mv_length_horizontal = reader.decodeExponentialGolombNumber();
    log2_max_mv_length_vertical = reader.decodeExponentialGolombNumber();
  }
  return {
    aspect_ratio_info_present_flag,
    aspect_ratio_idc,
    sar_width,
    sar_height,
    overscan_info_present_flag,
    overscan_appropriate_flag,
    video_signal_type_present_flag,
    video_format,
    video_full_range_flag,
    colour_description_present_flag,
    colour_primaries,
    transfer_characteristics,
    matrix_coeffs,
    chroma_loc_info_present_flag,
    chroma_sample_loc_type_top_field,
    chroma_sample_loc_type_bottom_field,
    neutral_chroma_indication_flag,
    field_seq_flag,
    frame_field_info_present_flag,
    default_display_window_flag,
    def_disp_win_left_offset,
    def_disp_win_right_offset,
    def_disp_win_top_offset,
    def_disp_win_bottom_offset,
    vui_timing_info_present_flag,
    vui_num_units_in_tick,
    vui_time_scale,
    vui_poc_proportional_to_timing_flag,
    vui_num_ticks_poc_diff_one_minus1,
    vui_hrd_parameters_present_flag,
    vui_hrd_parameters,
    bitstream_restriction_flag,
    tiles_fixed_structure_flag,
    motion_vectors_over_pic_boundaries_flag,
    restricted_ref_pic_lists_flag,
    min_spatial_segmentation_idc,
    max_bytes_per_pic_denom,
    max_bits_per_min_cu_denom,
    log2_max_mv_length_horizontal,
    log2_max_mv_length_vertical
  };
}
function h265ParseHrdParameters(reader, commonInfPresentFlag, maxNumSubLayersMinus1) {
  let nal_hrd_parameters_present_flag;
  let vcl_hrd_parameters_present_flag;
  let sub_pic_hrd_params_present_flag;
  let tick_divisor_minus2;
  let du_cpb_removal_delay_increment_length_minus1;
  let sub_pic_cpb_params_in_pic_timing_sei_flag;
  let dpb_output_delay_du_length_minus1;
  let bit_rate_scale;
  let cpb_size_scale;
  let cpb_size_du_scale;
  let initial_cpb_removal_delay_length_minus1;
  let au_cpb_removal_delay_length_minus1;
  let dpb_output_delay_length_minus1;
  if (commonInfPresentFlag) {
    nal_hrd_parameters_present_flag = !!reader.next();
    vcl_hrd_parameters_present_flag = !!reader.next();
    if (nal_hrd_parameters_present_flag || vcl_hrd_parameters_present_flag) {
      sub_pic_hrd_params_present_flag = !!reader.next();
      if (sub_pic_hrd_params_present_flag) {
        tick_divisor_minus2 = reader.read(8);
        du_cpb_removal_delay_increment_length_minus1 = reader.read(5);
        sub_pic_cpb_params_in_pic_timing_sei_flag = !!reader.next();
        dpb_output_delay_du_length_minus1 = reader.read(5);
      }
      bit_rate_scale = reader.read(4);
      cpb_size_scale = reader.read(4);
      if (sub_pic_hrd_params_present_flag) {
        cpb_size_du_scale = reader.read(4);
      }
      initial_cpb_removal_delay_length_minus1 = reader.read(5);
      au_cpb_removal_delay_length_minus1 = reader.read(5);
      dpb_output_delay_length_minus1 = reader.read(5);
    }
  }
  const fixed_pic_rate_general_flag = [];
  const fixed_pic_rate_within_cvs_flag = [];
  const elemental_duration_in_tc_minus1 = [];
  const low_delay_hrd_flag = [];
  const cpb_cnt_minus1 = [];
  const nalHrdParameters = [];
  const vclHrdParameters = [];
  for (let i = 0; i <= maxNumSubLayersMinus1; i += 1) {
    fixed_pic_rate_general_flag[i] = !!reader.next();
    if (!fixed_pic_rate_general_flag[i]) {
      fixed_pic_rate_within_cvs_flag[i] = !!reader.next();
    }
    if (fixed_pic_rate_within_cvs_flag[i]) {
      elemental_duration_in_tc_minus1[i] = reader.decodeExponentialGolombNumber();
    } else {
      low_delay_hrd_flag[i] = !!reader.next();
    }
    if (!low_delay_hrd_flag[i]) {
      cpb_cnt_minus1[i] = reader.decodeExponentialGolombNumber();
    }
    if (nal_hrd_parameters_present_flag) {
      nalHrdParameters[i] = h265ParseSubLayerHrdParameters(reader, i, getCpbCnt(cpb_cnt_minus1[i]));
    }
    if (vcl_hrd_parameters_present_flag) {
      vclHrdParameters[i] = h265ParseSubLayerHrdParameters(reader, i, getCpbCnt(cpb_cnt_minus1[i]));
    }
  }
  return {
    nal_hrd_parameters_present_flag,
    vcl_hrd_parameters_present_flag,
    sub_pic_hrd_params_present_flag,
    tick_divisor_minus2,
    du_cpb_removal_delay_increment_length_minus1,
    sub_pic_cpb_params_in_pic_timing_sei_flag,
    dpb_output_delay_du_length_minus1,
    bit_rate_scale,
    cpb_size_scale,
    cpb_size_du_scale,
    initial_cpb_removal_delay_length_minus1,
    au_cpb_removal_delay_length_minus1,
    dpb_output_delay_length_minus1,
    fixed_pic_rate_general_flag,
    fixed_pic_rate_within_cvs_flag,
    elemental_duration_in_tc_minus1,
    low_delay_hrd_flag,
    cpb_cnt_minus1,
    nalHrdParameters,
    vclHrdParameters
  };
}
function h265ParseSubLayerHrdParameters(reader, subLayerId, CpbCnt) {
  const bit_rate_value_minus1 = [];
  const cpb_size_value_minus1 = [];
  const cpb_size_du_value_minus1 = [];
  const bit_rate_du_value_minus1 = [];
  const cbr_flag = [];
  for (let i = 0; i < CpbCnt; i += 1) {
    bit_rate_value_minus1[i] = reader.decodeExponentialGolombNumber();
    cpb_size_value_minus1[i] = reader.decodeExponentialGolombNumber();
    if (subLayerId > 0) {
      cbr_flag[i] = !!reader.next();
    }
  }
  return {
    bit_rate_value_minus1,
    cpb_size_value_minus1,
    cpb_size_du_value_minus1,
    bit_rate_du_value_minus1,
    cbr_flag
  };
}
function getCpbCnt(cpb_cnt_minus_1) {
  return cpb_cnt_minus_1 + 1;
}
function h265SearchConfiguration(buffer2) {
  let videoParameterSet;
  let sequenceParameterSet;
  let pictureParameterSet;
  let count = 0;
  for (const nalu of annexBSplitNalu(buffer2)) {
    const header = h265ParseNaluHeader(nalu);
    const raw = {
      ...header,
      data: nalu,
      rbsp: nalu.subarray(2)
    };
    switch (header.nal_unit_type) {
      case 32:
        videoParameterSet = raw;
        break;
      case 33:
        sequenceParameterSet = raw;
        break;
      case 34:
        pictureParameterSet = raw;
        break;
      default:
        continue;
    }
    count += 1;
    if (count === 3) {
      return {
        videoParameterSet,
        sequenceParameterSet,
        pictureParameterSet
      };
    }
  }
  throw new Error("Invalid data");
}
function h265ParseSpsMultilayerExtension(reader) {
  const inter_view_mv_vert_constraint_flag = !!reader.next();
  return {
    inter_view_mv_vert_constraint_flag
  };
}
function h265ParseSps3dExtension(reader) {
  const iv_di_mc_enabled_flag = [];
  const iv_mv_scal_enabled_flag = [];
  iv_di_mc_enabled_flag[0] = !!reader.next();
  iv_mv_scal_enabled_flag[0] = !!reader.next();
  const log2_ivmc_sub_pb_size_minus3 = reader.decodeExponentialGolombNumber();
  const iv_res_pred_enabled_flag = !!reader.next();
  const depth_ref_enabled_flag = !!reader.next();
  const vsp_mc_enabled_flag = !!reader.next();
  const dbbp_enabled_flag = !!reader.next();
  iv_di_mc_enabled_flag[1] = !!reader.next();
  iv_mv_scal_enabled_flag[1] = !!reader.next();
  const tex_mc_enabled_flag = !!reader.next();
  const log2_texmc_sub_pb_size_minus3 = reader.decodeExponentialGolombNumber();
  const intra_contour_enabled_flag = !!reader.next();
  const intra_dc_only_wedge_enabled_flag = !!reader.next();
  const cqt_cu_part_pred_enabled_flag = !!reader.next();
  const inter_dc_only_enabled_flag = !!reader.next();
  const skip_intra_enabled_flag = !!reader.next();
  return {
    iv_di_mc_enabled_flag,
    iv_mv_scal_enabled_flag,
    log2_ivmc_sub_pb_size_minus3,
    iv_res_pred_enabled_flag,
    depth_ref_enabled_flag,
    vsp_mc_enabled_flag,
    dbbp_enabled_flag,
    tex_mc_enabled_flag,
    log2_texmc_sub_pb_size_minus3,
    intra_contour_enabled_flag,
    intra_dc_only_wedge_enabled_flag,
    cqt_cu_part_pred_enabled_flag,
    inter_dc_only_enabled_flag,
    skip_intra_enabled_flag
  };
}
function h265ParseConfiguration(data) {
  const { videoParameterSet, sequenceParameterSet, pictureParameterSet } = h265SearchConfiguration(data);
  const { profileTierLevel: { generalProfileTier: { profile_space: generalProfileSpace, tier_flag: generalTierFlag, profile_idc: generalProfileIndex, profileCompatibilitySet: generalProfileCompatibilitySet, constraintSet: generalConstraintSet }, general_level_idc: generalLevelIndex } } = h265ParseVideoParameterSet(videoParameterSet.rbsp);
  const { chroma_format_idc, pic_width_in_luma_samples: encodedWidth, pic_height_in_luma_samples: encodedHeight, conf_win_left_offset: cropLeft = 0, conf_win_right_offset: cropRight = 0, conf_win_top_offset: cropTop = 0, conf_win_bottom_offset: cropBottom = 0 } = h265ParseSequenceParameterSet(sequenceParameterSet.rbsp);
  const SubWidthC = getSubWidthC(chroma_format_idc);
  const SubHeightC = getSubHeightC(chroma_format_idc);
  const croppedWidth = encodedWidth - SubWidthC * (cropLeft + cropRight);
  const croppedHeight = encodedHeight - SubHeightC * (cropTop + cropBottom);
  return {
    videoParameterSet,
    sequenceParameterSet,
    pictureParameterSet,
    generalProfileSpace,
    generalProfileIndex,
    generalProfileCompatibilitySet,
    generalTierFlag,
    generalLevelIndex,
    generalConstraintSet,
    encodedWidth,
    encodedHeight,
    cropLeft,
    cropRight,
    cropTop,
    cropBottom,
    croppedWidth,
    croppedHeight
  };
}

// node_modules/@yume-chan/adb-scrcpy/esm/index.js
var esm_exports6 = {};
__export(esm_exports6, {
  AdbScrcpyClient: () => AdbScrcpyClient,
  AdbScrcpyConnection: () => AdbScrcpyConnection,
  AdbScrcpyExitedError: () => AdbScrcpyExitedError,
  AdbScrcpyForwardConnection: () => AdbScrcpyForwardConnection,
  AdbScrcpyOptions1_15: () => AdbScrcpyOptions1_15,
  AdbScrcpyOptions1_15_1: () => AdbScrcpyOptions1_15_1,
  AdbScrcpyOptions1_16: () => AdbScrcpyOptions1_16,
  AdbScrcpyOptions1_17: () => AdbScrcpyOptions1_17,
  AdbScrcpyOptions1_18: () => AdbScrcpyOptions1_18,
  AdbScrcpyOptions1_19: () => AdbScrcpyOptions1_19,
  AdbScrcpyOptions1_20: () => AdbScrcpyOptions1_20,
  AdbScrcpyOptions1_21: () => AdbScrcpyOptions1_21,
  AdbScrcpyOptions1_22: () => AdbScrcpyOptions1_22,
  AdbScrcpyOptions1_23: () => AdbScrcpyOptions1_23,
  AdbScrcpyOptions1_24: () => AdbScrcpyOptions1_24,
  AdbScrcpyOptions1_25: () => AdbScrcpyOptions1_25,
  AdbScrcpyOptions2_0: () => AdbScrcpyOptions2_0,
  AdbScrcpyOptions2_1: () => AdbScrcpyOptions2_1,
  AdbScrcpyOptions2_2: () => AdbScrcpyOptions2_2,
  AdbScrcpyOptions2_3: () => AdbScrcpyOptions2_3,
  AdbScrcpyOptions2_4: () => AdbScrcpyOptions2_4,
  AdbScrcpyOptions2_5: () => AdbScrcpyOptions2_5,
  AdbScrcpyOptions2_6: () => AdbScrcpyOptions2_6,
  AdbScrcpyOptions2_7: () => AdbScrcpyOptions2_7,
  AdbScrcpyOptions3_0: () => AdbScrcpyOptions3_0,
  AdbScrcpyOptions3_0_1: () => AdbScrcpyOptions3_0_1,
  AdbScrcpyOptions3_0_2: () => AdbScrcpyOptions3_0_2,
  AdbScrcpyOptions3_1: () => AdbScrcpyOptions3_1,
  AdbScrcpyOptions3_2: () => AdbScrcpyOptions3_2,
  AdbScrcpyOptions3_3: () => AdbScrcpyOptions3_3,
  AdbScrcpyOptions3_3_1: () => AdbScrcpyOptions3_3_1,
  AdbScrcpyOptions3_3_2: () => AdbScrcpyOptions3_3_2,
  AdbScrcpyOptions3_3_3: () => AdbScrcpyOptions3_3_3,
  AdbScrcpyOptionsLatest: () => AdbScrcpyOptionsLatest,
  AdbScrcpyReverseConnection: () => AdbScrcpyReverseConnection,
  SCRCPY_SOCKET_NAME_PREFIX: () => SCRCPY_SOCKET_NAME_PREFIX
});

// node_modules/@yume-chan/adb-scrcpy/esm/connection.js
var SCRCPY_SOCKET_NAME_PREFIX = "scrcpy";
var AdbScrcpyConnection = class {
  adb;
  options;
  socketName;
  constructor(adb, options) {
    this.adb = adb;
    this.options = options;
    this.socketName = this.getSocketName();
  }
  initialize() {
  }
  getSocketName() {
    let socketName = "localabstract:" + SCRCPY_SOCKET_NAME_PREFIX;
    if (this.options.scid !== void 0) {
      socketName += "_" + this.options.scid.padStart(8, "0");
    }
    return socketName;
  }
  dispose() {
  }
};
var AdbScrcpyForwardConnection = class extends AdbScrcpyConnection {
  #disposed = false;
  #connect() {
    return this.adb.createSocket(this.socketName);
  }
  async #connectAndRetry(sendDummyByte) {
    for (let i = 0; !this.#disposed && i < 100; i += 1) {
      try {
        const stream = await this.#connect();
        if (sendDummyByte) {
          const buffered = new BufferedReadableStream(stream.readable);
          await buffered.readExactly(1);
          return {
            readable: buffered.release(),
            writable: stream.writable
          };
        }
        return stream;
      } catch {
        await delay(100);
      }
    }
    throw new Error(`Can't connect to server after 100 retries`);
  }
  async getStreams() {
    let { sendDummyByte } = this.options;
    const streams = {};
    if (this.options.video) {
      const stream = await this.#connectAndRetry(sendDummyByte);
      streams.video = stream.readable;
      sendDummyByte = false;
    }
    if (this.options.audio) {
      const stream = await this.#connectAndRetry(sendDummyByte);
      streams.audio = stream.readable;
      sendDummyByte = false;
    }
    if (this.options.control) {
      const stream = await this.#connectAndRetry(sendDummyByte);
      streams.control = stream;
      sendDummyByte = false;
    }
    return streams;
  }
  dispose() {
    this.#disposed = true;
  }
};
var AdbScrcpyReverseConnection = class extends AdbScrcpyConnection {
  #streams;
  #address;
  async initialize() {
    await this.adb.reverse.remove(this.socketName).catch((e) => {
      if (e instanceof AdbReverseNotSupportedError) {
        throw e;
      }
    });
    let queueController;
    const queue = new PushReadableStream((controller) => {
      queueController = controller;
    });
    this.#streams = queue.getReader();
    this.#address = await this.adb.reverse.add(this.socketName, async (socket) => {
      await queueController.enqueue(socket);
    });
  }
  async #accept() {
    return (await this.#streams.read()).value;
  }
  async getStreams() {
    const streams = {};
    if (this.options.video) {
      const stream = await this.#accept();
      streams.video = stream.readable;
    }
    if (this.options.audio) {
      const stream = await this.#accept();
      streams.audio = stream.readable;
    }
    if (this.options.control) {
      const stream = await this.#accept();
      streams.control = stream;
    }
    return streams;
  }
  dispose() {
    this.adb.reverse.remove(this.#address).catch(NOOP2);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_15/impl/create-connection.js
function createConnection(adb, options) {
  const connectionOptions = {
    scid: void 0,
    // Not Supported
    video: true,
    // Always enabled
    audio: false,
    // Not Supported
    control: true,
    // Always enabled even when `--no-control` is specified
    sendDummyByte: true
    // Always enabled
  };
  if (options.tunnelForward) {
    return new AdbScrcpyForwardConnection(adb, connectionOptions);
  } else {
    return new AdbScrcpyReverseConnection(adb, connectionOptions);
  }
}

// node_modules/@yume-chan/adb-scrcpy/esm/video.js
var AdbScrcpyVideoStream = class {
  #options;
  #metadata;
  get metadata() {
    return this.#metadata;
  }
  #stream;
  get stream() {
    return this.#stream;
  }
  #sizeChanged = new StickyEventEmitter();
  get sizeChanged() {
    return this.#sizeChanged.event;
  }
  #width = 0;
  get width() {
    return this.#width;
  }
  #height = 0;
  get height() {
    return this.#height;
  }
  constructor(options, metadata, stream) {
    this.#options = options;
    this.#metadata = metadata;
    this.#stream = stream.pipeThrough(this.#options.createMediaStreamTransformer()).pipeThrough(new InspectStream((packet) => {
      if (packet.type === "configuration") {
        switch (metadata.codec) {
          case ScrcpyVideoCodecId.H264:
            this.#configureH264(packet.data);
            break;
          case ScrcpyVideoCodecId.H265:
            this.#configureH265(packet.data);
            break;
          case ScrcpyVideoCodecId.AV1:
            break;
        }
      } else if (metadata.codec === ScrcpyVideoCodecId.AV1) {
        this.#configureAv1(packet.data);
      }
    }));
  }
  #configureH264(data) {
    const { croppedWidth, croppedHeight } = h264ParseConfiguration(data);
    this.#width = croppedWidth;
    this.#height = croppedHeight;
    this.#sizeChanged.fire({ width: croppedWidth, height: croppedHeight });
  }
  #configureH265(data) {
    const { croppedWidth, croppedHeight } = h265ParseConfiguration(data);
    this.#width = croppedWidth;
    this.#height = croppedHeight;
    this.#sizeChanged.fire({ width: croppedWidth, height: croppedHeight });
  }
  #configureAv1(data) {
    const parser = new Av1(data);
    const sequenceHeader = parser.searchSequenceHeaderObu();
    if (!sequenceHeader) {
      return;
    }
    const { max_frame_width_minus_1, max_frame_height_minus_1 } = sequenceHeader;
    const width = max_frame_width_minus_1 + 1;
    const height = max_frame_height_minus_1 + 1;
    this.#width = width;
    this.#height = height;
    this.#sizeChanged.fire({ width, height });
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/client.js
function arrayToStream(array) {
  return new PushReadableStream(async (controller) => {
    for (const item of array) {
      await controller.enqueue(item);
    }
  });
}
function concatStreams(...streams) {
  return new PushReadableStream(async (controller) => {
    for (const stream of streams) {
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        await controller.enqueue(value);
      }
    }
  });
}
var AdbScrcpyExitedError = class extends Error {
  output;
  constructor(output) {
    super("scrcpy server exited prematurely");
    this.output = output;
  }
};
var AdbScrcpyClient = class _AdbScrcpyClient {
  static async pushServer(adb, file, filename = DefaultServerPath) {
    const sync = await adb.sync();
    try {
      await sync.write({
        filename,
        file
      });
    } finally {
      await sync.dispose();
    }
  }
  static async start(adb, path, options) {
    let connection;
    let process;
    try {
      try {
        connection = options.createConnection(adb);
        await connection.initialize();
      } catch (e) {
        if (e instanceof AdbReverseNotSupportedError) {
          options.value.tunnelForward = true;
          connection = options.createConnection(adb);
          await connection.initialize();
        } else {
          connection = void 0;
          throw e;
        }
      }
      const args = [
        `CLASSPATH=${path}`,
        // Set environment variable
        "app_process",
        "/",
        // Parent dir (unused but required)
        "com.genymobile.scrcpy.Server",
        options.version,
        ...options.serialize()
      ];
      if (options.spawner) {
        process = await options.spawner.spawn(args);
      } else {
        process = await adb.subprocess.noneProtocol.spawn(args);
      }
      const output = process.output.pipeThrough(new TextDecoderStream()).pipeThrough(new SplitStringStream("\n"));
      const lines = [];
      const abortController = new AbortController();
      const pipe = output.pipeTo(new WritableStream({
        write(chunk) {
          lines.push(chunk);
        }
      }), {
        signal: abortController.signal,
        preventCancel: true
      }).catch((e) => {
        if (abortController.signal.aborted) {
          return;
        }
        throw e;
      });
      const streams = await Promise.race([
        process.exited.then(() => {
          throw new AdbScrcpyExitedError(lines);
        }),
        connection.getStreams()
      ]);
      abortController.abort();
      await pipe;
      return new _AdbScrcpyClient({
        options,
        process,
        output: concatStreams(arrayToStream(lines), output),
        videoStream: streams.video,
        audioStream: streams.audio,
        controlStream: streams.control
      });
    } catch (e) {
      await process?.kill();
      throw e;
    } finally {
      connection?.dispose();
    }
  }
  /**
   * This method will modify the given `options`,
   * so don't reuse it elsewhere.
   */
  static getEncoders(adb, path, options) {
    options.setListEncoders();
    return options.getEncoders(adb, path);
  }
  /**
   * This method will modify the given `options`,
   * so don't reuse it elsewhere.
   */
  static getDisplays(adb, path, options) {
    options.setListDisplays();
    return options.getDisplays(adb, path);
  }
  #options;
  #process;
  #output;
  get output() {
    return this.#output;
  }
  get exited() {
    return this.#process.exited;
  }
  #videoStream;
  /**
   * Gets a `Promise` that resolves to the parsed video stream.
   *
   * On server version 2.1 and above, it will be `undefined` if
   * video is disabled by `options.video: false`.
   *
   * Note: if it's not `undefined`, it must be consumed to prevent
   * the connection from being blocked.
   */
  get videoStream() {
    return this.#videoStream;
  }
  #audioStream;
  /**
   * Gets a `Promise` that resolves to the parsed audio stream.
   *
   * On server versions before 2.0, it will always be `undefined`.
   * On server version 2.0 and above, it will be `undefined` if
   * audio is disabled by `options.audio: false`.
   *
   * Note: if it's not `undefined`, it must be consumed to prevent
   * the connection from being blocked.
   */
  get audioStream() {
    return this.#audioStream;
  }
  #controller;
  /**
   * Gets the control message writer.
   *
   * On server version 1.22 and above, it will be `undefined` if
   * control is disabled by `options.control: false`.
   */
  get controller() {
    return this.#controller;
  }
  get clipboard() {
    return this.#options.clipboard;
  }
  constructor({ options, process, output, videoStream, audioStream, controlStream }) {
    this.#options = options;
    this.#process = process;
    this.#output = output;
    this.#videoStream = videoStream ? this.#createVideoStream(videoStream) : void 0;
    this.#audioStream = audioStream ? this.#createAudioStream(audioStream) : void 0;
    if (controlStream) {
      this.#controller = new ScrcpyControlMessageWriter(controlStream.writable.getWriter(), options);
      this.#parseDeviceMessages(controlStream.readable).catch(() => {
      });
    }
  }
  async #parseDeviceMessages(controlStream) {
    const buffered = new BufferedReadableStream(controlStream);
    try {
      while (true) {
        let id;
        try {
          const result = await buffered.readExactly(1);
          id = result[0];
        } catch (e) {
          if (e instanceof ExactReadableEndedError) {
            this.#options.deviceMessageParsers.close();
            break;
          }
          throw e;
        }
        await this.#options.deviceMessageParsers.parse(id, buffered);
      }
    } catch (e) {
      this.#options.deviceMessageParsers.error(e);
      await tryCancel(buffered);
    }
  }
  async #createVideoStream(initialStream) {
    const { metadata, stream } = await this.#options.parseVideoStreamMetadata(initialStream);
    return new AdbScrcpyVideoStream(this.#options, metadata, stream);
  }
  async #createAudioStream(initialStream) {
    if (!this.#options.parseAudioStreamMetadata) {
      throw new Error("parsing audio stream is not supported in this version");
    }
    const metadata = await this.#options.parseAudioStreamMetadata(initialStream);
    switch (metadata.type) {
      case "disabled":
      case "errored":
        return metadata;
      case "success":
        return {
          ...metadata,
          stream: metadata.stream.pipeThrough(this.#options.createMediaStreamTransformer())
        };
      default:
        throw new Error(`Unexpected audio metadata type ${metadata["type"]}`);
    }
  }
  async close() {
    await this.#process.kill();
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_15/impl/get-displays.js
async function getDisplays(adb, path, options) {
  try {
    const client = await AdbScrcpyClient.start(adb, path, options);
    await client.close();
    throw new Error("Unexpected server output");
  } catch (e) {
    if (e instanceof AdbScrcpyExitedError) {
      if (e.output[0]?.startsWith("[server] ERROR:")) {
        throw e;
      }
      const displays = [];
      for (const line of e.output) {
        const display = options.parseDisplay(line);
        if (display) {
          displays.push(display);
        }
      }
      return displays;
    }
    throw e;
  }
}

// node_modules/@yume-chan/adb-scrcpy/esm/1_15/options.js
var AdbScrcpyOptions1_15 = class extends ScrcpyOptions1_15 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.15";
    this.spawner = clientOptions?.spawner;
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_15_1.js
var AdbScrcpyOptions1_15_1 = class extends ScrcpyOptions1_15_1 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.15.1";
    this.spawner = clientOptions?.spawner;
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_16.js
var AdbScrcpyOptions1_16 = class extends ScrcpyOptions1_16 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.16";
    this.spawner = clientOptions?.spawner;
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_17/impl/get-encoders.js
async function getEncoders(adb, path, options) {
  const client = await AdbScrcpyClient.start(adb, path, options);
  const encoders = [];
  for await (const line of client.output) {
    const encoder = options.parseEncoder(line);
    if (encoder) {
      encoders.push(encoder);
    }
  }
  return encoders;
}

// node_modules/@yume-chan/adb-scrcpy/esm/1_17/options.js
var AdbScrcpyOptions1_17 = class extends ScrcpyOptions1_17 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.17";
    this.spawner = clientOptions?.spawner;
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_18.js
var AdbScrcpyOptions1_18 = class extends ScrcpyOptions1_18 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.18";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_19.js
var AdbScrcpyOptions1_19 = class extends ScrcpyOptions1_19 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.19";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_20.js
var AdbScrcpyOptions1_20 = class extends ScrcpyOptions1_20 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.20";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_21.js
var AdbScrcpyOptions1_21 = class extends ScrcpyOptions1_21 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.21";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_22/impl/create-connection.js
function createConnection2(adb, options) {
  const connectionOptions = {
    scid: void 0,
    // Not Supported
    video: true,
    // Always enabled
    audio: false,
    // Not Supported
    control: options.control,
    sendDummyByte: options.sendDummyByte
  };
  if (options.tunnelForward) {
    return new AdbScrcpyForwardConnection(adb, connectionOptions);
  } else {
    return new AdbScrcpyReverseConnection(adb, connectionOptions);
  }
}

// node_modules/@yume-chan/adb-scrcpy/esm/1_22/options.js
var AdbScrcpyOptions1_22 = class extends ScrcpyOptions1_22 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.22";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection2(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_23.js
var AdbScrcpyOptions1_23 = class extends ScrcpyOptions1_23 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.23";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection2(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_24.js
var AdbScrcpyOptions1_24 = class extends ScrcpyOptions1_24 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.24";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection2(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_25.js
var AdbScrcpyOptions1_25 = class extends ScrcpyOptions1_25 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "1.25";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection2(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/2_0/impl/create-connection.js
function createConnection3(adb, options) {
  const connectionOptions = {
    scid: toScrcpyOptionValue(options.scid, void 0),
    video: true,
    // Always enabled
    audio: options.audio,
    control: options.control,
    sendDummyByte: options.sendDummyByte
  };
  if (options.tunnelForward) {
    return new AdbScrcpyForwardConnection(adb, connectionOptions);
  } else {
    return new AdbScrcpyReverseConnection(adb, connectionOptions);
  }
}

// node_modules/@yume-chan/adb-scrcpy/esm/2_0/impl/get-encoders.js
async function getEncoders2(adb, path, options) {
  try {
    const client = await AdbScrcpyClient.start(adb, path, options);
    await client.close();
    throw new Error("Unexpected server output");
  } catch (e) {
    if (e instanceof AdbScrcpyExitedError) {
      if (e.output[0]?.startsWith("[server] ERROR:")) {
        throw e;
      }
      const encoders = [];
      for (const line of e.output) {
        const encoder = options.parseEncoder(line);
        if (encoder) {
          encoders.push(encoder);
        }
      }
      return encoders;
    }
    throw e;
  }
}

// node_modules/@yume-chan/adb-scrcpy/esm/2_0/options.js
var AdbScrcpyOptions2_0 = class extends ScrcpyOptions2_0 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "2.0";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection3(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/2_1/impl/create-connection.js
function createConnection4(adb, options) {
  const connectionOptions = {
    scid: toScrcpyOptionValue(options.scid, void 0),
    video: options.video,
    audio: options.audio,
    control: options.control,
    sendDummyByte: options.sendDummyByte
  };
  if (options.tunnelForward) {
    return new AdbScrcpyForwardConnection(adb, connectionOptions);
  } else {
    return new AdbScrcpyReverseConnection(adb, connectionOptions);
  }
}

// node_modules/@yume-chan/adb-scrcpy/esm/2_1/options.js
var AdbScrcpyOptions2_1 = class extends ScrcpyOptions2_1 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "2.1";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/2_2.js
var AdbScrcpyOptions2_2 = class extends ScrcpyOptions2_2 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "v2.2";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/2_3.js
var AdbScrcpyOptions2_3 = class extends ScrcpyOptions2_3 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "2.3";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/2_4.js
var AdbScrcpyOptions2_4 = class extends ScrcpyOptions2_4 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "2.4";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/2_5.js
var AdbScrcpyOptions2_5 = class extends ScrcpyOptions2_5 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "2.5";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/2_6.js
var AdbScrcpyOptions2_6 = class extends ScrcpyOptions2_6 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "2.6";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/2_7.js
var AdbScrcpyOptions2_7 = class extends ScrcpyOptions2_7 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "2.7";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/3_0.js
var AdbScrcpyOptions3_0 = class extends ScrcpyOptions3_0 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "3.0";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/3_0_1.js
var AdbScrcpyOptions3_0_1 = class extends ScrcpyOptions3_0_1 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "3.0.1";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/3_0_2.js
var AdbScrcpyOptions3_0_2 = class extends ScrcpyOptions3_0_2 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "3.0.2";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/3_1.js
var AdbScrcpyOptions3_1 = class extends ScrcpyOptions3_1 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "3.1";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/3_2.js
var AdbScrcpyOptions3_2 = class extends ScrcpyOptions3_2 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "3.2";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/3_3.js
var AdbScrcpyOptions3_3 = class extends ScrcpyOptions3_3 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "3.3";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/3_3_1.js
var AdbScrcpyOptions3_3_1 = class extends ScrcpyOptions3_3_1 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "3.3.1";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/3_3_2.js
var AdbScrcpyOptions3_3_2 = class extends ScrcpyOptions3_3_2 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "3.3.2";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/3_3_3.js
var AdbScrcpyOptions3_3_3 = class extends ScrcpyOptions3_3_1 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "3.3.3";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders2(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection4(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/latest.js
var AdbScrcpyOptionsLatest = class extends AdbScrcpyOptions3_3_3 {
  constructor(init, clientOptions) {
    super(init, clientOptions);
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/codec/utils.js
function hexDigits(value) {
  return value.toString(16).toUpperCase();
}
function hexTwoDigits(value) {
  return value.toString(16).toUpperCase().padStart(2, "0");
}
function decimalTwoDigits(value) {
  return value.toString(10).padStart(2, "0");
}

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/codec/av1.js
var Av1Codec = class {
  #decoder;
  #updateSize;
  #options;
  #config;
  #configured = false;
  constructor(decoder, updateSize, options) {
    this.#decoder = decoder;
    this.#updateSize = updateSize;
    this.#options = options;
  }
  #parseConfig(data) {
    const parser = new Av1(data);
    const sequenceHeader = parser.searchSequenceHeaderObu();
    if (!sequenceHeader) {
      return;
    }
    const { seq_profile: seqProfile, seq_level_idx: [seqLevelIdx = 0], max_frame_width_minus_1, max_frame_height_minus_1, color_config: { BitDepth, mono_chrome: monoChrome, subsampling_x: subsamplingX, subsampling_y: subsamplingY, chroma_sample_position: chromaSamplePosition, color_description_present_flag } } = sequenceHeader;
    let colorPrimaries;
    let transferCharacteristics;
    let matrixCoefficients;
    let colorRange;
    if (color_description_present_flag) {
      ({
        color_primaries: colorPrimaries,
        transfer_characteristics: transferCharacteristics,
        matrix_coefficients: matrixCoefficients,
        color_range: colorRange
      } = sequenceHeader.color_config);
    } else {
      colorPrimaries = Av1.ColorPrimaries.Bt709;
      transferCharacteristics = Av1.TransferCharacteristics.Bt709;
      matrixCoefficients = Av1.MatrixCoefficients.Bt709;
      colorRange = false;
    }
    const width = max_frame_width_minus_1 + 1;
    const height = max_frame_height_minus_1 + 1;
    this.#updateSize(width, height);
    const codec = [
      "av01",
      seqProfile.toString(16),
      decimalTwoDigits(seqLevelIdx) + (sequenceHeader.seq_tier[0] ? "H" : "M"),
      decimalTwoDigits(BitDepth),
      monoChrome ? "1" : "0",
      (subsamplingX ? "1" : "0") + (subsamplingY ? "1" : "0") + chromaSamplePosition.toString(),
      decimalTwoDigits(colorPrimaries),
      decimalTwoDigits(transferCharacteristics),
      decimalTwoDigits(matrixCoefficients),
      colorRange ? "1" : "0"
    ].join(".");
    this.#config = {
      codec,
      hardwareAcceleration: this.#options?.hardwareAcceleration ?? "no-preference",
      optimizeForLatency: true
    };
    this.#configured = false;
  }
  decode(packet) {
    if (packet.type === "configuration") {
      return;
    }
    this.#parseConfig(packet.data);
    if (!this.#config) {
      throw new Error("Decoder not configured");
    }
    if (packet.keyframe) {
      if (this.#decoder.decodeQueueSize) {
        this.#decoder.reset();
        this.#decoder.configure(this.#config);
        this.#configured = true;
      } else if (!this.#configured) {
        this.#decoder.configure(this.#config);
        this.#configured = true;
      }
    }
    this.#decoder.decode(new EncodedVideoChunk({
      // AV1 requires Scrcpy 2.0 where `keyframe` flag must be set
      type: packet.keyframe ? "key" : "delta",
      timestamp: 0,
      data: packet.data
    }));
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/codec/h26x.js
var H26xDecoder = class {
  #decoder;
  #config;
  #configured = false;
  constructor(decoder) {
    this.#decoder = decoder;
  }
  #configureAndDecodeFirstKeyframe(config, packet) {
    this.#decoder.configure(config);
    this.#configured = true;
    const { raw } = config;
    const data = new Uint8Array(raw.length + packet.data.length);
    data.set(raw, 0);
    data.set(packet.data, raw.length);
    this.#decoder.decode(new EncodedVideoChunk({
      type: "key",
      timestamp: 0,
      data
    }));
  }
  decode(packet) {
    if (packet.type === "configuration") {
      this.#config = {
        ...this.configure(packet.data),
        raw: packet.data
      };
      this.#configured = false;
      return;
    }
    if (!this.#config) {
      throw new Error("Decoder not configured");
    }
    if (packet.keyframe) {
      if (this.#decoder.decodeQueueSize) {
        this.#decoder.reset();
        this.#configureAndDecodeFirstKeyframe(this.#config, packet);
        return;
      }
      if (!this.#configured) {
        this.#configureAndDecodeFirstKeyframe(this.#config, packet);
        return;
      }
    }
    if (!this.#configured) {
      if (packet.keyframe === void 0) {
        this.#configureAndDecodeFirstKeyframe(this.#config, packet);
        return;
      }
      throw new Error("Expect a keyframe but got a delta frame");
    }
    this.#decoder.decode(new EncodedVideoChunk({
      // Treat `undefined` as `key`, otherwise won't decode.
      type: packet.keyframe === false ? "delta" : "key",
      timestamp: 0,
      data: packet.data
    }));
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/codec/h264.js
var H264Decoder = class extends H26xDecoder {
  #updateSize;
  #options;
  constructor(decoder, updateSize, options) {
    super(decoder);
    this.#updateSize = updateSize;
    this.#options = options;
  }
  configure(data) {
    const { profileIndex, constraintSet, levelIndex, croppedWidth, croppedHeight } = h264ParseConfiguration(data);
    this.#updateSize(croppedWidth, croppedHeight);
    const codec = "avc1." + hexTwoDigits(profileIndex) + hexTwoDigits(constraintSet) + hexTwoDigits(levelIndex);
    return {
      codec,
      hardwareAcceleration: this.#options?.hardwareAcceleration ?? "no-preference",
      optimizeForLatency: true
    };
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/codec/h265.js
var H265Decoder = class extends H26xDecoder {
  #updateSize;
  #options;
  constructor(decoder, updateSize, options) {
    super(decoder);
    this.#updateSize = updateSize;
    this.#options = options;
  }
  configure(data) {
    const { generalProfileSpace, generalProfileIndex, generalProfileCompatibilitySet, generalTierFlag, generalLevelIndex, generalConstraintSet, croppedWidth, croppedHeight } = h265ParseConfiguration(data);
    this.#updateSize(croppedWidth, croppedHeight);
    const codec = [
      "hev1",
      ["", "A", "B", "C"][generalProfileSpace] + generalProfileIndex.toString(),
      hexDigits(getUint32LittleEndian(generalProfileCompatibilitySet, 0)),
      (generalTierFlag ? "H" : "L") + generalLevelIndex.toString(),
      ...Array.from(generalConstraintSet, hexDigits)
    ].join(".");
    return {
      codec,
      // Microsoft Edge requires explicit size to work
      codedWidth: croppedWidth,
      codedHeight: croppedHeight,
      hardwareAcceleration: this.#options?.hardwareAcceleration ?? "no-preference",
      optimizeForLatency: true
    };
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/pool.js
var Pool = class {
  #controller;
  #readable = new ReadableStream({
    start: (controller) => {
      this.#controller = controller;
    },
    pull: (controller) => {
      controller.enqueue(this.#initializer());
    }
  }, { highWaterMark: 0 });
  #reader = this.#readable.getReader();
  #initializer;
  #size = 0;
  #capacity;
  constructor(initializer, capacity) {
    this.#initializer = initializer;
    this.#capacity = capacity;
  }
  async borrow() {
    const result = await this.#reader.read();
    return result.value;
  }
  return(value) {
    if (this.#size < this.#capacity) {
      this.#controller.enqueue(value);
      this.#size += 1;
    }
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/snapshot.js
var VideoFrameCapturer = class {
  #canvas;
  #context;
  constructor() {
    if (typeof OffscreenCanvas !== "undefined") {
      this.#canvas = new OffscreenCanvas(1, 1);
    } else {
      this.#canvas = document.createElement("canvas");
      this.#canvas.width = 1;
      this.#canvas.height = 1;
    }
    this.#context = this.#canvas.getContext("bitmaprenderer", {
      alpha: false
    });
  }
  async capture(frame) {
    this.#canvas.width = frame.displayWidth;
    this.#canvas.height = frame.displayHeight;
    const bitmap = await createImageBitmap(frame);
    this.#context.transferFromImageBitmap(bitmap);
    if (this.#canvas instanceof OffscreenCanvas) {
      return await this.#canvas.convertToBlob({
        type: "image/png"
      });
    } else {
      return new Promise((resolve, reject) => {
        this.#canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to convert canvas to blob"));
          } else {
            resolve(blob);
          }
        }, "image/png");
      });
    }
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/decoder.js
var VideoFrameCapturerPool = /* @__PURE__ */ new Pool(() => new VideoFrameCapturer(), 4);
var WebCodecsVideoDecoder = class {
  static get isSupported() {
    return typeof globalThis.VideoDecoder !== "undefined";
  }
  static capabilities = {
    h264: {},
    h265: {},
    av1: {}
  };
  #codec;
  get codec() {
    return this.#codec;
  }
  #renderer;
  get renderer() {
    return this.#renderer;
  }
  #options;
  #codecDecoder;
  #writable;
  get writable() {
    return this.#writable;
  }
  #error;
  #controller;
  #framesDraw = 0;
  #framesPresented = 0;
  get framesRendered() {
    return this.#framesPresented;
  }
  #framesSkipped = 0;
  get framesSkipped() {
    return this.#framesSkipped;
  }
  #sizeChanged = new StickyEventEmitter();
  get sizeChanged() {
    return this.#sizeChanged.event;
  }
  #width = 0;
  get width() {
    return this.#width;
  }
  #height = 0;
  get height() {
    return this.#height;
  }
  #decoder;
  #drawing = false;
  #nextFrame;
  #captureFrame;
  #animationFrameId = 0;
  /**
   * Create a new WebCodecs video decoder.
   */
  constructor({ codec, renderer, ...options }) {
    this.#codec = codec;
    this.#renderer = renderer;
    this.#options = options;
    this.#decoder = new VideoDecoder({
      output: (frame) => {
        this.#captureFrame?.close();
        this.#captureFrame = frame.clone();
        if (this.#drawing) {
          if (this.#nextFrame) {
            this.#nextFrame.close();
            this.#framesSkipped += 1;
          }
          this.#nextFrame = frame;
          return;
        }
        void this.#draw(frame);
      },
      error: (error) => {
        this.#setError(error);
      }
    });
    switch (this.#codec) {
      case ScrcpyVideoCodecId.H264:
        this.#codecDecoder = new H264Decoder(this.#decoder, this.#updateSize, this.#options);
        break;
      case ScrcpyVideoCodecId.H265:
        this.#codecDecoder = new H265Decoder(this.#decoder, this.#updateSize, this.#options);
        break;
      case ScrcpyVideoCodecId.AV1:
        this.#codecDecoder = new Av1Codec(this.#decoder, this.#updateSize, this.#options);
        break;
      default:
        throw new Error(`Unsupported codec: ${this.#codec}`);
    }
    this.#writable = new WritableStream({
      start: (controller) => {
        if (this.#error) {
          controller.error(this.#error);
        } else {
          this.#controller = controller;
        }
      },
      write: (packet) => {
        this.#codecDecoder.decode(packet);
      }
    });
    this.#handleAnimationFrame();
  }
  #setError(error) {
    if (this.#controller) {
      try {
        this.#controller.error(error);
      } catch {
      }
    } else {
      this.#error = error;
    }
  }
  async #draw(frame) {
    try {
      this.#drawing = true;
      this.#updateSize(frame.displayWidth, frame.displayHeight);
      await this.#renderer.draw(frame);
      this.#framesDraw += 1;
      frame.close();
      if (this.#nextFrame) {
        const frame2 = this.#nextFrame;
        this.#nextFrame = void 0;
        await this.#draw(frame2);
      }
      this.#drawing = false;
    } catch (error) {
      this.#setError(error);
    }
  }
  #updateSize = (width, height) => {
    this.#renderer.setSize(width, height);
    this.#width = width;
    this.#height = height;
    this.#sizeChanged.fire({ width, height });
  };
  #handleAnimationFrame = () => {
    if (this.#framesDraw > 0) {
      this.#framesPresented += 1;
      this.#framesSkipped += this.#framesDraw - 1;
      this.#framesDraw = 0;
    }
    this.#animationFrameId = requestAnimationFrame(this.#handleAnimationFrame);
  };
  async snapshot() {
    const frame = this.#captureFrame;
    if (!frame) {
      return void 0;
    }
    const capturer = await VideoFrameCapturerPool.borrow();
    const result = await capturer.capture(frame);
    VideoFrameCapturerPool.return(capturer);
    return result;
  }
  dispose() {
    cancelAnimationFrame(this.#animationFrameId);
    if (this.#decoder.state !== "closed") {
      this.#decoder.close();
    }
    this.#nextFrame?.close();
    this.#captureFrame?.close();
  }
};

// node_modules/@yume-chan/scrcpy-decoder-tinyh264/esm/decoder.js
var import_yuv_buffer = __toESM(require_yuv_buffer(), 1);
var import_yuv_canvas = __toESM(require_yuv_canvas(), 1);

// node_modules/@yume-chan/scrcpy-decoder-tinyh264/esm/wrapper.js
var worker;
var workerReady = false;
var pendingResolvers = [];
var streamId = 0;
var PICTURE_READY_SUBSCRIPTIONS = /* @__PURE__ */ new Map();
function subscribePictureReady(streamId2, handler) {
  PICTURE_READY_SUBSCRIPTIONS.set(streamId2, handler);
  return {
    dispose() {
      PICTURE_READY_SUBSCRIPTIONS.delete(streamId2);
    }
  };
}
var TinyH264Wrapper = class extends AutoDisposable {
  streamId;
  #pictureReadyEvent = new EventEmitter();
  get onPictureReady() {
    return this.#pictureReadyEvent.event;
  }
  constructor(streamId2) {
    super();
    this.streamId = streamId2;
    this.addDisposable(subscribePictureReady(streamId2, this.#handlePictureReady));
  }
  #handlePictureReady = (e) => {
    this.#pictureReadyEvent.fire(e);
  };
  feed(data) {
    worker.postMessage({
      type: "decode",
      data,
      offset: 0,
      length: data.byteLength,
      renderStateId: this.streamId
    }, [data]);
  }
  dispose() {
    super.dispose();
    worker.postMessage({
      type: "release",
      renderStateId: this.streamId
    });
  }
};
function createTinyH264Wrapper() {
  if (!worker) {
    worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module"
    });
    worker.addEventListener("message", ({ data }) => {
      switch (data.type) {
        case "decoderReady":
          workerReady = true;
          for (const resolver of pendingResolvers) {
            resolver.resolve(new TinyH264Wrapper(streamId));
            streamId += 1;
          }
          pendingResolvers.length = 0;
          break;
        case "pictureReady":
          PICTURE_READY_SUBSCRIPTIONS.get(data.renderStateId)?.(data);
          break;
      }
    });
  }
  if (!workerReady) {
    const resolver = new PromiseResolver();
    pendingResolvers.push(resolver);
    return resolver.promise;
  }
  const decoder = new TinyH264Wrapper(streamId);
  streamId += 1;
  return Promise.resolve(decoder);
}

// node_modules/@yume-chan/scrcpy-decoder-tinyh264/esm/decoder.js
var noop = () => {
};
function createCanvas() {
  if (typeof document !== "undefined") {
    return document.createElement("canvas");
  }
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(1, 1);
  }
  throw new Error("no canvas input found nor any canvas can be created");
}
var TinyH264Decoder = class {
  static capabilities = {
    h264: {
      maxProfile: AndroidAvcProfile.Baseline,
      maxLevel: AndroidAvcLevel.Level4
    }
  };
  #renderer;
  get renderer() {
    return this.#renderer;
  }
  #sizeChanged = new StickyEventEmitter();
  get sizeChanged() {
    return this.#sizeChanged.event;
  }
  #width = 0;
  get width() {
    return this.#width;
  }
  #height = 0;
  get height() {
    return this.#height;
  }
  #frameRendered = 0;
  get framesRendered() {
    return this.#frameRendered;
  }
  #frameSkipped = 0;
  get framesSkipped() {
    return this.#frameSkipped;
  }
  #writable;
  get writable() {
    return this.#writable;
  }
  #yuvCanvas;
  #initializer;
  constructor({ canvas } = {}) {
    if (canvas) {
      this.#renderer = canvas;
    } else {
      this.#renderer = createCanvas();
    }
    this.#writable = new WritableStream({
      write: async (packet) => {
        switch (packet.type) {
          case "configuration":
            await this.#configure(packet.data);
            break;
          case "data": {
            if (!this.#initializer) {
              throw new Error("Decoder not configured");
            }
            const wrapper = await this.#initializer.promise;
            wrapper.feed(packet.data.slice().buffer);
            break;
          }
        }
      }
    });
  }
  async #configure(data) {
    this.dispose();
    this.#initializer = new PromiseResolver();
    if (!this.#yuvCanvas) {
      const canvas = createCanvas();
      const attributes = {
        // Disallow software rendering.
        // Other rendering methods are faster than software-based WebGL.
        failIfMajorPerformanceCaveat: true
      };
      const gl = canvas.getContext("webgl2", attributes) || canvas.getContext("webgl", attributes);
      this.#yuvCanvas = import_yuv_canvas.default.attach(this.#renderer, {
        webGL: !!gl
      });
    }
    const { encodedWidth, encodedHeight, croppedWidth, croppedHeight, cropLeft, cropTop } = h264ParseConfiguration(data);
    this.#width = croppedWidth;
    this.#height = croppedHeight;
    this.#sizeChanged.fire({
      width: croppedWidth,
      height: croppedHeight
    });
    const chromaWidth = encodedWidth / 2;
    const chromaHeight = encodedHeight / 2;
    const format = import_yuv_buffer.default.format({
      width: encodedWidth,
      height: encodedHeight,
      chromaWidth,
      chromaHeight,
      cropLeft,
      cropTop,
      cropWidth: croppedWidth,
      cropHeight: croppedHeight,
      displayWidth: croppedWidth,
      displayHeight: croppedHeight
    });
    const wrapper = await createTinyH264Wrapper();
    this.#initializer.resolve(wrapper);
    const uPlaneOffset = encodedWidth * encodedHeight;
    const vPlaneOffset = uPlaneOffset + chromaWidth * chromaHeight;
    wrapper.onPictureReady(({ data: data2 }) => {
      this.#frameRendered += 1;
      const array = new Uint8Array(data2);
      const frame = import_yuv_buffer.default.frame(format, import_yuv_buffer.default.lumaPlane(format, array, encodedWidth, 0), import_yuv_buffer.default.chromaPlane(format, array, chromaWidth, uPlaneOffset), import_yuv_buffer.default.chromaPlane(format, array, chromaWidth, vPlaneOffset));
      this.#yuvCanvas.drawFrame(frame);
    });
    wrapper.feed(data.slice().buffer);
  }
  dispose() {
    this.#initializer?.promise.then((wrapper) => wrapper.dispose()).catch(noop);
    this.#initializer = void 0;
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/render/canvas.js
var CanvasVideoFrameRenderer = class {
  #canvas;
  get canvas() {
    return this.#canvas;
  }
  constructor(canvas) {
    if (canvas) {
      this.#canvas = canvas;
    } else {
      this.#canvas = createCanvas();
    }
  }
  setSize(width, height) {
    if (this.#canvas.width !== width || this.#canvas.height !== height) {
      this.#canvas.width = width;
      this.#canvas.height = height;
    }
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/render/bitmap.js
var BitmapVideoFrameRenderer = class extends CanvasVideoFrameRenderer {
  #context;
  constructor(canvas) {
    super(canvas);
    this.#context = this.canvas.getContext("bitmaprenderer", {
      alpha: false
    });
  }
  async draw(frame) {
    const bitmap = await createImageBitmap(frame);
    this.#context.transferFromImageBitmap(bitmap);
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/render/insertable-stream.js
var InsertableStreamVideoFrameRenderer = class {
  static get isSupported() {
    return typeof MediaStreamTrackGenerator !== "undefined";
  }
  #element;
  get element() {
    return this.#element;
  }
  #generator;
  #writer;
  #stream;
  constructor(element) {
    if (element) {
      this.#element = element;
    } else if (typeof document !== "undefined") {
      this.#element = document.createElement("video");
    } else {
      throw new Error("no video element input found nor any video element can be created");
    }
    this.#element.muted = true;
    this.#element.autoplay = true;
    this.#element.disablePictureInPicture = true;
    this.#element.disableRemotePlayback = true;
    this.#generator = new MediaStreamTrackGenerator({ kind: "video" });
    this.#writer = this.#generator.writable.getWriter();
    this.#stream = new MediaStream([this.#generator]);
    this.#element.srcObject = this.#stream;
  }
  setSize(width, height) {
    if (this.#element.width !== width || this.#element.height !== height) {
      this.#element.width = width;
      this.#element.height = height;
    }
  }
  async draw(frame) {
    await this.#writer.write(frame);
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/render/webgl.js
var Resolved = Promise.resolve();
function createContext(canvas, enableCapture) {
  const attributes = {
    // Low-power GPU should be enough for video rendering.
    powerPreference: "low-power",
    alpha: false,
    // Disallow software rendering.
    // Other rendering methods are faster than software-based WebGL.
    failIfMajorPerformanceCaveat: true,
    preserveDrawingBuffer: !!enableCapture
  };
  return canvas.getContext("webgl2", attributes) || canvas.getContext("webgl", attributes);
}
var WebGLVideoFrameRenderer = class _WebGLVideoFrameRenderer extends CanvasVideoFrameRenderer {
  static vertexShaderSource = `
        attribute vec2 xy;

        varying highp vec2 uv;

        void main(void) {
            gl_Position = vec4(xy, 0.0, 1.0);
            // Map vertex coordinates (-1 to +1) to UV coordinates (0 to 1).
            // UV coordinates are Y-flipped relative to vertex coordinates.
            uv = vec2((1.0 + xy.x) / 2.0, (1.0 - xy.y) / 2.0);
        }
`;
  static fragmentShaderSource = `
        varying highp vec2 uv;

        uniform sampler2D texture;

        void main(void) {
            gl_FragColor = texture2D(texture, uv);
        }
`;
  static get isSupported() {
    const canvas = createCanvas();
    return !!createContext(canvas);
  }
  #context;
  /**
   * Create a new WebGL frame renderer.
   * @param canvas The canvas to render frames to.
   * @param enableCapture
   * Whether to allow capturing the canvas content using APIs like `readPixels` and `toDataURL`.
   * Enable this option may reduce performance.
   */
  constructor(canvas, enableCapture) {
    super(canvas);
    const gl = createContext(this.canvas, enableCapture);
    if (!gl) {
      throw new Error("WebGL not supported");
    }
    this.#context = gl;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, _WebGLVideoFrameRenderer.vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(vertexShader));
    }
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, _WebGLVideoFrameRenderer.fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(fragmentShader));
    }
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(shaderProgram));
    }
    gl.useProgram(shaderProgram);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const xyLocation = gl.getAttribLocation(shaderProgram, "xy");
    gl.vertexAttribPointer(xyLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(xyLocation);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  draw(frame) {
    const gl = this.#context;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frame);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    return Resolved;
  }
};
export {
  ADB_DAEMON_DEFAULT_FEATURES,
  ADB_DAEMON_DEFAULT_INITIAL_PAYLOAD_SIZE,
  ADB_DAEMON_VERSION_OMIT_CHECKSUM,
  ADB_DEFAULT_AUTHENTICATORS,
  ADB_SERVER_DEFAULT_FEATURES,
  ADB_SYNC_MAX_PACKET_SIZE,
  ASN1_NULL,
  ASN1_OCTET_STRING,
  ASN1_OID,
  ASN1_SEQUENCE,
  Adb,
  AdbAuthType,
  AdbAuthenticationProcessor,
  AdbBanner,
  AdbBannerKey,
  AdbCommand,
  AdbDaemonSocket,
  AdbDaemonSocketController,
  AdbDaemonTransport,
  AdbDaemonWebUsbConnection,
  AdbDaemonWebUsbDevice,
  AdbDaemonWebUsbDeviceManager,
  AdbDaemonWebUsbDeviceObserver,
  AdbDefaultInterfaceFilter,
  AdbFeature,
  AdbFrameBufferError,
  AdbFrameBufferForbiddenError,
  AdbFrameBufferUnsupportedVersionError,
  AdbFrameBufferV1,
  AdbFrameBufferV2,
  AdbNoneProtocolProcessImpl,
  AdbNoneProtocolPtyProcess,
  AdbNoneProtocolSpawner,
  AdbNoneProtocolSubprocessService,
  AdbPacket,
  AdbPacketDispatcher,
  AdbPacketHeader,
  AdbPacketSerializeStream,
  AdbPower,
  AdbPublicKeyAuthenticator,
  AdbReverseError,
  AdbReverseErrorResponse,
  AdbReverseNotSupportedError,
  AdbReverseService,
  esm_exports6 as AdbScrcpy,
  AdbServerClient,
  AdbServerDeviceObserverOwner,
  AdbServerStream,
  AdbServerTransport,
  AdbServiceBase,
  AdbShellProtocolId,
  AdbShellProtocolPacket,
  AdbShellProtocolProcessImpl,
  AdbShellProtocolPtyProcess,
  AdbShellProtocolSpawner,
  AdbShellProtocolSubprocessService,
  AdbSignatureAuthenticator,
  AdbSubprocessService,
  AdbSync,
  AdbSyncDataResponse,
  AdbSyncEntry2Response,
  AdbSyncEntryResponse,
  AdbSyncError,
  AdbSyncFailResponse,
  AdbSyncLstatResponse,
  AdbSyncNumberRequest,
  AdbSyncOkResponse,
  AdbSyncRequestId,
  AdbSyncResponseId,
  AdbSyncSendV2Flags,
  AdbSyncSendV2Request,
  AdbSyncSocket,
  AdbSyncSocketLocked,
  AdbSyncStatErrorCode,
  AdbSyncStatResponse,
  AdbTcpIpService,
  AdbWebCredentialStore,
  esm_exports4 as AndroidBin,
  AutoResetEvent,
  BitmapVideoFrameRenderer,
  CanvasVideoFrameRenderer,
  esm_exports3 as Event,
  FAIL,
  InsertableStreamVideoFrameRenderer,
  LinuxFileType,
  NOOP2 as NOOP,
  Ref,
  SHA1_DIGEST_INFO,
  SHA1_DIGEST_LENGTH,
  esm_exports5 as Scrcpy,
  esm_exports2 as StreamExtra,
  esm_exports as Struct,
  TinyH264Decoder,
  WebCodecsVideoDecoder,
  WebGLVideoFrameRenderer,
  adbGeneratePublicKey,
  adbGetPublicKeySize,
  adbSyncEncodeId,
  adbSyncLstat,
  adbSyncOpenDir,
  adbSyncOpenDirV1,
  adbSyncOpenDirV2,
  adbSyncPull,
  adbSyncPullGenerator,
  adbSyncPush,
  adbSyncPushV1,
  adbSyncPushV2,
  adbSyncReadResponse,
  adbSyncReadResponses,
  adbSyncStat,
  adbSyncWriteRequest,
  calculateBase64EncodedLength,
  calculateChecksum,
  decodeBase64,
  decodeUtf8,
  dirname,
  encodeBase64,
  encodeUtf8,
  escapeArg,
  findUsbEndpoints,
  findUsbInterface,
  framebuffer,
  getBigUint,
  getSerialNumber,
  hexToNumber,
  isErrorName,
  isUsbInterfaceFilter,
  matchFilter,
  matchFilters,
  mergeDefaultAdbInterfaceFilter,
  modInverse,
  powMod,
  raceSignal,
  rsaParsePrivateKey,
  rsaSign,
  sequenceEqual,
  setBigUint,
  splitCommand,
  toLocalUint8Array,
  unorderedRemove,
  unreachable,
  write4HexDigits
};
/*! Bundled license information:

yuv-canvas/src/depower.js:
  (**
   * Convert a ratio into a bit-shift count; for instance a ratio of 2
   * becomes a bit-shift of 1, while a ratio of 1 is a bit-shift of 0.
   *
   * @author Brooke Vibber <bvibber@pobox.com>
   * @copyright 2016-2024
   * @license MIT-style
   *
   * @param {number} ratio - the integer ratio to convert.
   * @returns {number} - number of bits to shift to multiply/divide by the ratio.
   * @throws exception if given a non-power-of-two
   *)

yuv-canvas/src/YCbCr.js:
  (**
   * Basic YCbCr->RGB conversion
   *
   * @author Brooke Vibber <bvibber@pobox.com>
   * @copyright 2014-2024
   * @license MIT-style
   *
   * @param {YUVFrame} buffer - input frame buffer
   * @param {Uint8ClampedArray} output - array to draw RGBA into
   * Assumes that the output array already has alpha channel set to opaque.
   *)
*/
