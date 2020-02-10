var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { tr } from '../../tr/tr.js';
import MapLayers from './maplayers.js';
import PaletteTexture from './palettetexture.js';

function isCentral(type) {
    return type == 'nuke' || type == 'ccgt' || type == 'fusion';
}

var curForType = {
    ccgt: 0,
    nuke: 1,
    fusion: 2,
    pv: 3,
    wind: 3,
    battery: 3
};

var MapView = function (_React$Component) {
    _inherits(MapView, _React$Component);

    /* accepted props :
    mousemove : function(curPos)    -> called on mouse move && mouse leave  (then with undefined curPos)
    click : function(curPos)        -> called on click
    cursor : {type, radius} type : undefined or string (pv, nuke, ...)
                            radius : undefined or Number. unit : px
    */
    function MapView(props) {
        _classCallCheck(this, MapView);

        var _this = _possibleConstructorReturn(this, (MapView.__proto__ || Object.getPrototypeOf(MapView)).call(this, props));
        //react


        _this.state = {
            energyGrid: true,
            flows: false,
            base: 'groundUse'
        };

        _this._toogleLayer = _this._toogleLayer.bind(_this);

        //drag ----------------------------------------------------
        _this.draw = _this.draw.bind(_this);
        _this.mousedown = _this.onmousedown.bind(_this);
        _this.mousemove = _this.onmousemove.bind(_this);
        _this.mouseup = _this.onmouseup.bind(_this);
        _this.wheel = _this.onwheel.bind(_this);

        _this.mouseleave = _this.onmouseleave.bind(_this);

        _this.physMousePos = { x: 0, y: 0 }; // cursor pos (px) in window coord
        //transforms logical coord -> physical coord
        // physMousePos  = (logicMousePos + translate) * scale
        _this.transform = { x: -0, y: -0, scale: 0.64 };
        //is the mouse curently down
        _this.isMouseDown = false;

        // content --------------------------------------------------

        //array of positions of ponctual stuff (nuke, ccgt, ...). format : type, pos
        _this.items = [];

        // //current cursor
        // this.cursor = {
        //     type: null,   //will be str, (nuke| ccgt| fusion| pv| bat| wind)
        //     pos: {        //note : logical pos (not transformed)
        //         x: null,
        //         y: null
        //     },
        //     radius: null,
        // };
        return _this;
    }

    /** @brief update the given layer*/


    _createClass(MapView, [{
        key: 'update',
        value: function update(layerName) {
            throw 'todo';
            // if(this[layerName+'Src'] === undefined)
            //     throw 'olala';
            // // this.energy.update(this.energySrc);
            // this[layerName].update(this[layerName+'Src']);
        }

        // conceptually, mapView stores a Map (id, color)
        // this function return the next free id and maps it to its coresponding color

    }, {
        key: 'appendEnergyPalette',
        value: function appendEnergyPalette(type) {
            var r = void 0,
                g = void 0,
                b = void 0,
                a = 255;
            if (type == 'pv') {
                r = 70;g = 85;b = 130;
            } else if (type == 'battery') {
                r = 0;g = 255;b = 250;
            } else if (type == 'wind') {
                r = 255;g = 255;b = 250;a = 128;
            } else {
                throw 'todo';
            }

            return this.energy.appendPalette(r, g, b, a);
        }

        /// adds a point item at the given position
        /// NOTE : tmp ; should be a red square. NOT TESTED

    }, {
        key: 'addItem',
        value: function addItem(type, pos) {
            if (!isCentral(type)) throw 'not possible';

            this.items.push({ type: type, pos: pos });
            //update gl
            this._updatePtsBuf();
            this.draw();
        }

        //removes a central

    }, {
        key: 'rmItem',
        value: function rmItem(type, pos) {
            if (!isCentral(type)) throw 'not possible';

            var id = this.items.findIndex(function (v) {
                return v.type === type && v.pos.x === pos.x && v.pos.y === pos.y;
            });

            this.items.splice(id, 1);

            //update gl
            this._updatePtsBuf();
            this.draw();
        }

        //internal functions--------------------------------------------------------

    }, {
        key: '_toogleLayer',
        value: function _toogleLayer(name) {
            if (['energyGrid', 'flows'].includes(name)) this.setState(function (state) {
                return _defineProperty({}, name, !state[name]);
            });else this.setState({ base: name });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var canvas = this.refs.mapCanvas;

            this.gl = canvas.getContext("webgl", { alpha: false });

            var gl = this.gl;

            this.instancing = gl.getExtension("ANGLE_instanced_arrays");

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.clearColor(1, 1, 1, 1);

            this._initMapShader();
            this._initTextures();
            this._initPointShader();

            console.log("mount mapview !");

            this.draw();
            window.addEventListener('resize', this.draw);

            window.addEventListener('mousedown', this.mousedown);
            window.addEventListener('mousemove', this.mousemove);
            window.addEventListener('mouseup', this.mouseup);
            window.addEventListener('wheel', this.wheel);
        }
    }, {
        key: 'render',
        value: function render() {
            this.draw();

            return React.createElement(
                'div',
                { id: 'dMapBox' },
                React.createElement(MapLayers, {
                    base: this.state.base,
                    energyGrid: this.state.energyGrid,
                    flows: this.state.flows,
                    setVisible: this._toogleLayer }),
                React.createElement(
                    'canvas',
                    {
                        ref: 'mapCanvas',
                        onMouseLeave: this.mouseleave
                    },
                    tr("Your browser is not supported")
                )
            );
        }

        /** @brief draw the currenty visible layers.
        @note if nuke cursor, draw flows
        */

    }, {
        key: 'draw',
        value: function draw() {
            var _this2 = this;

            requestAnimationFrame(function () {
                var gl = _this2.gl;
                if (gl === undefined) return;

                /// handle any canvas resize event
                _this2.checkSize();

                //compute the transformation matrix
                var unitSquareToPix = stMat.scale(1374, 1183);
                var pixTrans = stMat.mul(stMat.scale(_this2.transform.scale, _this2.transform.scale), stMat.translate(_this2.transform.x, _this2.transform.y));
                var pixToNDC = stMat.mul(stMat.translate(-1, 1), stMat.scale(2 / gl.canvas.width, -2 / gl.canvas.height));

                _this2.mvProj = stMat.mul(stMat.mul(pixToNDC, pixTrans), unitSquareToPix);

                //clear canvas
                _this2.gl.clear(_this2.gl.COLOR_BUFFER_BIT);

                //draw base
                _this2._drawTex(_this2[_this2.state.base]);

                //draw energy grid if toogled
                if (_this2.state.energyGrid) _this2._drawTex(_this2.energy);

                //draw flows if toogled or user is building a central
                if ((isCentral(_this2.props.cursor.type) || _this2.state.flows) && _this2.water) _this2._drawTex(_this2.water);

                //point positions are in pixels already
                _this2.mvProj = stMat.mul(pixToNDC, pixTrans);
                //draw all the point items
                _this2._drawPoints();

                _this2.mvProj = stMat.mul(stMat.mul(pixToNDC, pixTrans), unitSquareToPix);

                // //draw the cursor
                // if(isCentral(this.state.cursor.type)){
                //     // this._drawCentralCursor();
                // }
                // else if(['pv', 'battery', 'wind'].includes(this.state.cursor.type)){
                //     this._drawAreaCursor();
                // }
            });
        }
    }, {
        key: '_drawAreaCursor',
        value: function _drawAreaCursor() {}
    }, {
        key: 'checkSize',
        value: function checkSize() {
            // return;

            var gl = this.gl;
            var canvas = gl.canvas;
            // Lookup the size the browser is displaying the canvas.
            var displayWidth = window.innerWidth;
            var displayHeight = window.innerWidth;

            // Check if the canvas is not the same size.
            if (canvas.width != displayWidth || canvas.height != displayHeight) {
                // console.log('resize', displayHeight);

                // Make the canvas the same size
                canvas.width = displayWidth;
                canvas.height = displayHeight;

                gl.viewport(0, 0, canvas.width, canvas.height);

                // let ratio;
                // if(displayWidth > displayHeight){
                //     ratio = stMat.scale(displayWidth/displayHeight, 1);
                // }
                // else {
                //     ratio = stMat.scale(1,displayHeight/displayWidth);
                // }
                //
                // this.proj = stMat.mul(ratio, stMat.scale(1/window.innerWidth, 1/window.innerHeight));
            }
        }
    }, {
        key: 'onmousedown',
        value: function onmousedown(e) {
            if (e.target != this.refs.mapCanvas) return;

            this.isMouseDown = true;
            this.physMousePos = { x: e.pageX, y: e.pageY };
        }
    }, {
        key: 'onmousemove',
        value: function onmousemove(e) {
            // if(e.target != this.refs.mapCanvas)
            //     return;

            if (this.isMouseDown) {

                this.transform.x += (e.pageX - this.physMousePos.x) / this.transform.scale;
                this.transform.y += (e.pageY - this.physMousePos.y) / this.transform.scale;

                this.physMousePos.x = e.pageX;
                this.physMousePos.y = e.pageY;

                this.draw();
            } else {
                var rawPos = { x: e.pageX, y: e.pageY };

                var transformedPos = {
                    x: Math.round(rawPos.x / this.transform.scale - this.transform.x),
                    y: Math.round(rawPos.y / this.transform.scale - this.transform.y)
                };

                this.props.mousemove(transformedPos);
            }
        }
    }, {
        key: 'onmouseup',
        value: function onmouseup(e) {
            this.isMouseDown = false;

            if (e.target != this.refs.mapCanvas) return;
        }
    }, {
        key: 'onwheel',
        value: function onwheel(e) {
            var curX = e.pageX,
                curY = e.pageY;

            var origin = {
                x: curX / this.transform.scale - this.transform.x,
                y: curY / this.transform.scale - this.transform.y
            };

            if (e.deltaY > 0) {
                this.transform.scale *= 0.8;
            } else {
                this.transform.scale /= 0.8;
            }

            //bounds
            this.transform.scale = Math.max(this.transform.scale, Math.pow(0.8, 4)); //unzoom
            this.transform.scale = Math.min(this.transform.scale, Math.pow(1 / 0.8, 8)); //zoom

            this.transform.x = curX / this.transform.scale - origin.x;
            this.transform.y = curY / this.transform.scale - origin.y;

            this.draw();
        }

        //called when cursor leaves direct contact with central area

    }, {
        key: 'onmouseleave',
        value: function onmouseleave(e) {
            this.props.mousemove(undefined);
        }
    }, {
        key: '_drawTex',
        value: function _drawTex(paletteTexture) {
            var gl = this.gl; //shortcut

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, paletteTexture.texture);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, paletteTexture.palette.tex);

            gl.useProgram(this._mapShader);
            this.mvProj.uniform(gl, this._texmodelviewLoc);

            //send the points
            gl.enableVertexAttribArray(0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._mapVertBuffer);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

            //bind the textures
            gl.uniform1i(this._imageLoc, 0);
            gl.uniform1i(this._paletteLoc, 1);
            //draw
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    }, {
        key: '_initMapShader',
        value: function _initMapShader() {
            var vert = '\n        attribute vec4 a_position;\n        varying vec2 v_texcoord;\n        uniform mat3 texmodelview;\n\n        void main() {\n          gl_Position = vec4(vec3(texmodelview * vec3(a_position.xy, 1.0)).xy, 0.0, 1.0);\n\n          v_texcoord = a_position.xy;\n        }\n        ';

            var frag = '\n        precision mediump float;\n        varying vec2 v_texcoord;\n        uniform sampler2D u_image;\n        uniform sampler2D u_palette;\n\n        void main() {\n            vec2 palXY = texture2D(u_image, v_texcoord).ra * 255.0;\n            gl_FragColor = texture2D(u_palette, (palXY + vec2(0.5)) / 256.0);\n        }\n        ';

            var gl = this.gl; //shortcut


            this._mapShader = createProgram(gl, [vert, frag]);

            this._imageLoc = gl.getUniformLocation(this._mapShader, "u_image");
            this._paletteLoc = gl.getUniformLocation(this._mapShader, "u_palette");
            this._texmodelviewLoc = gl.getUniformLocation(this._mapShader, "texmodelview");

            // Setup a unit quad
            var positions = [1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0];
            this._mapVertBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._mapVertBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        }
    }, {
        key: '_initTextures',
        value: function _initTextures() {
            this.energy = new PaletteTexture(this.gl, 2);
            this.energy.appendPalette(0, 0, 0, 0); //index 0 is transparent
            this.energy.update(this.props.cMap.energyGrid);

            this._initTexGroundUse();
            this._initTexPopDensity();
            this._initTexFlows();
            this._initWindPowDens();
        }
    }, {
        key: '_initTexGroundUse',
        value: function _initTexGroundUse() {
            this.groundUse = new PaletteTexture(this.gl, 1);

            this.groundUse.appendPalette(0, 0, 0, 0); //exterior
            this.groundUse.appendPalette(120, 120, 120); //airport
            this.groundUse.appendPalette(100, 140, 146); //water
            this.groundUse.appendPalette(59, 85, 48 /*52, 76, 45*/); //forest
            this.groundUse.appendPalette(120, 120, 97); //indus
            this.groundUse.appendPalette(114, 122, 74 /*183, 191, 154*/); //field
            this.groundUse.appendPalette(89, 109, 44 /*120, 124, 74*/); //field
            this.groundUse.appendPalette(114, 122, 74); //?
            this.groundUse.appendPalette(137, 141, 131); // city
            this.groundUse.appendPalette(52, 76, 45); //forest2

            this.groundUse.update(this.props.cMap.groundUse);
        }
    }, {
        key: '_initTexPopDensity',
        value: function _initTexPopDensity() {
            this.popDensity = new PaletteTexture(this.gl, 1);

            this.popDensity.appendPalette(0, 0, 0, 0); //out of country
            this.popDensity.appendPalette(255, 255, 128); // 0-20 h/km2
            this.popDensity.appendPalette(252, 233, 106); // 21-50 h/km2
            this.popDensity.appendPalette(250, 209, 85); // 51-100 h/km2
            this.popDensity.appendPalette(247, 190, 67); // 101-200 h/km2
            this.popDensity.appendPalette(242, 167, 46); // 201-500 h/km2
            this.popDensity.appendPalette(207, 122, 31); // 501-1k h/km2
            this.popDensity.appendPalette(173, 83, 19); // 1k1-2k h/km2
            this.popDensity.appendPalette(138, 46, 10); // 5k1-5k h/km2
            this.popDensity.appendPalette(107, 0, 0); // 5k1-50k h/km2

            this.popDensity.update(this.props.cMap.popDensity);
        }
    }, {
        key: '_initTexFlows',
        value: function _initTexFlows() {
            var self = this;
            fetch('hydro/flowdisplay.bin').then(function (response) {
                return response.arrayBuffer();
            }).then(function (waterData) {
                self.water = new PaletteTexture(self.gl, 1);
                self.water.appendPalette(0, 0, 255, 0); // j'ai  presque honte
                for (var i = 1; i < 256; i++) {
                    self.water.appendPalette(100, 140, 246, i);
                }var arr = new Uint8Array(waterData);
                self.water.update(arr);
            }).catch(function (e) {
                alert('prob load water ' + e);
            });
        }
    }, {
        key: '_initWindPowDens',
        value: function _initWindPowDens() {
            this.windPowDensAt50 = new PaletteTexture(this.gl, 1);

            this.windPowDensAt50.appendPalette(255, 255, 255);
            for (var i = 0; i < 2; i++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(197, 233, 250);
            for (var _i = 0; _i < 2; _i++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(178, 226, 249);
            for (var _i2 = 0; _i2 < 2; _i2++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(141, 204, 238);
            for (var _i3 = 0; _i3 < 2; _i3++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(123, 187, 229);
            for (var _i4 = 0; _i4 < 2; _i4++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(106, 173, 220);
            for (var _i5 = 0; _i5 < 2; _i5++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(90, 158, 212);
            for (var _i6 = 0; _i6 < 2; _i6++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(72, 142, 202);
            for (var _i7 = 0; _i7 < 3; _i7++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(72, 150, 173);
            for (var _i8 = 0; _i8 < 2; _i8++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(72, 158, 148);
            for (var _i9 = 0; _i9 < 2; _i9++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(73, 165, 124);
            for (var _i10 = 0; _i10 < 2; _i10++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(73, 173, 99);
            for (var _i11 = 0; _i11 < 2; _i11++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(73, 181, 70);
            for (var _i12 = 0; _i12 < 2; _i12++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(111, 192, 75);
            for (var _i13 = 0; _i13 < 2; _i13++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(145, 202, 79);
            for (var _i14 = 0; _i14 < 2; _i14++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(178, 211, 83);
            for (var _i15 = 0; _i15 < 3; _i15++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(212, 221, 87);
            for (var _i16 = 0; _i16 < 5; _i16++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(250, 232, 92);
            for (var _i17 = 0; _i17 < 5; _i17++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(249, 208, 82);
            for (var _i18 = 0; _i18 < 5; _i18++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(248, 184, 73);
            for (var _i19 = 0; _i19 < 6; _i19++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(247, 160, 63);
            for (var _i20 = 0; _i20 < 5; _i20++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(246, 137, 53);
            for (var _i21 = 0; _i21 < 5; _i21++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(245, 106, 41);
            for (var _i22 = 0; _i22 < 5; _i22++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(238, 92, 41);
            for (var _i23 = 0; _i23 < 6; _i23++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(232, 78, 41);
            for (var _i24 = 0; _i24 < 5; _i24++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(226, 63, 40);
            for (var _i25 = 0; _i25 < 5; _i25++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(211, 31, 40);
            for (var _i26 = 0; _i26 < 12; _i26++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(199, 35, 52);
            for (var _i27 = 0; _i27 < 11; _i27++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(188, 39, 65);
            for (var _i28 = 0; _i28 < 12; _i28++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(176, 43, 77);
            for (var _i29 = 0; _i29 < 11; _i29++) {
                this.windPowDensAt50.appendPalette(0, 0, 0, 0);
            }this.windPowDensAt50.appendPalette(165, 47, 90);

            this.windPowDensAt50.update(this.props.cMap.windPowDens.at50);
        }
    }, {
        key: '_initPointShader',
        value: function _initPointShader() {
            var vert = '\n        //xy is center of the quad,  (px)\n        //z  is texture index : 0 : ccgt, 1 nuke, 2 : fusion, 3 circle\n        //w  is circle radius (px). ignored for cursor != circle.\n        attribute vec4 a_position;\n        //point coord in {0,1}^2\n        attribute vec2 a_texcoord;\n\n\n\n        varying float v_tex;         //passes a_position.z\n        varying vec2 v_pointcoord;  //passes a_texcoord\n        uniform mat3 texmodelview;  //transformation\n        uniform vec4 overrideValue; //cursor info\n        uniform vec2 invScreenSize; //1/screen.*\n\n\n        void main() {\n            v_pointcoord = a_texcoord; //pass the tex coord\n            vec4 me = a_position;\n            vec2 snormCoord = 2.0 * a_texcoord - vec2(1.0); //also coords, but range from -1 to 1\n\n            if(a_position.x < 0.0){ //its an invalid x -> we know its the cursor -> replace it with cursor value\n                me = overrideValue;\n\n                if(overrideValue.z > 2.5){           //it is a round cursor : dynamic point size\n                    v_tex = me.z;\n                    gl_Position = vec4(\n                            vec3(texmodelview * vec3(    //transformation\n                                me.xy                    //square origin\n                                + snormCoord * me.w // +/- radius\n                                , 1.0)).xy,\n                            0.0, 1.0);\n\n                    return;\n                }\n            }\n\n            v_tex = me.z;\n\n            gl_Position = vec4(\n                    vec3(texmodelview * vec3(me.xy, 1.0)).xy  //transformation of the position\n                    + snormCoord*32.0*invScreenSize,         // +/- 32 pix\n                0.0, 1.0);\n        }\n        ';

            var frag = '\n        precision mediump float;\n        varying float v_tex;\n        varying vec2 v_pointcoord;\n        uniform sampler2D u_image;\n\n        void main() {\n            vec2 offset = vec2(0.0);\n            if(v_tex < 0.5){ //ccgt\n                offset = vec2(0.0, 0.5);\n            }\n            else if(v_tex < 1.5){ //nuke\n                offset = vec2(0.5);\n            }\n            else if(v_tex < 2.5){ //fusion\n                offset = vec2(0.0);\n            }\n            else if(v_tex < 3.5){ // its a circle\n                vec2 centered = v_pointcoord * 2.0 - vec2(1.0);\n                if( dot(centered, centered) < 1.0)\n                    gl_FragColor = vec4(0.5, 0.5, 0.5, 0.8);\n                else\n                    gl_FragColor = vec4(0.0);\n                return;\n            }\n\n            gl_FragColor = texture2D(u_image, vec2(v_pointcoord * 0.5 + offset) * vec2(1.0, -1.0) + vec2(0.0, 1.0) );\n            // gl_FragColor = texture2D(u_image, v_pointcoord  * vec2(1.0, -1.0) + vec2(0.0, 1.0) );\n        }\n        ';

            var gl = this.gl; //shortcut


            this._ptsShader = createProgram(gl, [vert, frag]);

            this._mvLocInPtsShader = gl.getUniformLocation(this._ptsShader, "texmodelview");
            this._cursorLocInPtsShader = gl.getUniformLocation(this._ptsShader, "overrideValue");
            this._texPtsLocInPtsShader = gl.getUniformLocation(this._ptsShader, "u_image");
            this._invScreenSizePtsLocInPtsShader = gl.getUniformLocation(this._ptsShader, "invScreenSize");

            this._updatePtsBuf();

            this._texPts = loadTexture(gl, 'res/icons/itemTex.png');

            //create the quad buf
            var texCoords = new Uint8Array([0, 0, 0, 255, 255, 0, 255, 255, 0, 255, 255, 0]); // 1 quad = 2 tri = 6 pts
            this._quadBuffer = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
        }

        //

    }, {
        key: '_updatePtsBuf',
        value: function _updatePtsBuf() {
            var gl = this.gl; //shortcut


            var positions = new Float32Array(4 * (this.items.length + 1)); //4 float per item + cursor

            positions[0] = -1; //x -> cursor so -1


            for (var i = 0; i < this.items.length; i++) {
                positions[i * 4 + 4 + 0] = this.items[i].pos.x; //x
                positions[i * 4 + 4 + 1] = this.items[i].pos.y; //y

                positions[i * 4 + 4 + 2] = curForType[this.items[i].type]; //z
            }

            this._ptsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._ptsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        }
    }, {
        key: '_drawPoints',
        value: function _drawPoints() {
            // return;
            var gl = this.gl; //shortcut

            //bind point sprites
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._texPts);

            gl.useProgram(this._ptsShader);
            this.mvProj.uniform(gl, this._mvLocInPtsShader);
            gl.uniform2fv(this._invScreenSizePtsLocInPtsShader, [2.0 / gl.canvas.width, 2.0 / gl.canvas.height]); //no cursor : offset it

            if (this.props.cursor.type === undefined) gl.uniform4fv(this._cursorLocInPtsShader, [-1000000, 0, 0, 0]); //no cursor : offset it
            else {
                    gl.uniform4fv(this._cursorLocInPtsShader, [this.props.cursor.pos.x, this.props.cursor.pos.y, curForType[this.props.cursor.type], this.props.cursor.radius]);
                    // console.log(this.props.cursor.radius);
                }

            //send the pointstexmodelviewLoc
            gl.enableVertexAttribArray(0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._ptsBuffer);
            gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
            this.instancing.vertexAttribDivisorANGLE(0, 1);
            // this.instancing.vertexAttribDivisorANGLE(0, 0);

            //send the square
            gl.enableVertexAttribArray(1);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuffer);
            gl.vertexAttribPointer(1, //concern  VertexAttribArray 1
            2, //2 components
            gl.UNSIGNED_BYTE, //unsigned bytes each
            true, //normalize them
            0, // no space between them
            0); //no offset at buffer beginning


            // //bind the textures
            gl.uniform1i(this._texPtsLocInPtsShader, 0);
            //     gl.uniform1i(this._paletteLoc, 1);
            //draw
            this.instancing.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, this.items.length + 1); // each tile is 6 verdices

            this.instancing.vertexAttribDivisorANGLE(0, 0); //reset instancing
            gl.disableVertexAttribArray(1);
        }
    }]);

    return MapView;
}(React.Component);

/// scale translate matrix


export default MapView;

var stMat = function () {
    //identity
    function stMat() {
        _classCallCheck(this, stMat);

        this.sx = 1.0;
        this.sy = 1.0;
        this.tx = 0.0;
        this.ty = 0.0;
    }

    _createClass(stMat, [{
        key: 'uniform',
        value: function uniform(gl, loc) {
            gl.uniformMatrix3fv(loc, gl.FALSE, [this.sx, 0.0, 0, 0.0, this.sy, 0, this.tx, this.ty, 1]);
        }
    }, {
        key: 'inverse',
        value: function inverse() {
            var ans = new stMat();

            //(TS)-1 = S-1 T-1

            ans.sx = 1.0 / this.sx;
            ans.sy = 1.0 / this.sy;

            ans.tx = -ans.sx * this.tx;
            ans.ty = -ans.sy * this.ty;

            return ans;
        }
    }], [{
        key: 'scale',
        value: function scale(scaleX, scaleY) {
            var ans = new stMat();
            ans.sx = scaleX;
            ans.sy = scaleY;
            return ans;
        }
    }, {
        key: 'translate',
        value: function translate(x, y) {
            var ans = new stMat();
            ans.tx = x;
            ans.ty = y;
            return ans;
        }

        /// return A*B

    }, {
        key: 'mul',
        value: function mul(A, B) {
            if (!(A instanceof stMat) || !(B instanceof stMat)) throw 'matrices only';

            var ans = new stMat();

            ans.sx = A.sx * B.sx;
            ans.sy = A.sy * B.sy;

            ans.tx = A.sx * B.tx + A.tx;
            ans.ty = A.sy * B.ty + A.ty;

            return ans;
        }
    }]);

    return stMat;
}();

function createShader(gl, sourceCode, type) {
    // Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var info = gl.getShaderInfoLog(shader);
        throw 'Could not compile WebGL program. \n\n' + info;
    }
    return shader;
}

function createProgram(gl, src, attribs) {
    var program = gl.createProgram();

    // Attach pre-existing shaders
    gl.attachShader(program, createShader(gl, src[0], gl.VERTEX_SHADER));
    gl.attachShader(program, createShader(gl, src[1], gl.FRAGMENT_SHADER));

    gl.bindAttribLocation(program, 0, 'a_position');
    gl.bindAttribLocation(program, 1, 'a_texcoord');

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var info = gl.getProgramInfoLog(program);
        throw 'Could not compile WebGL program. \n\n' + info;
    }
    return program;
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    var level = 0;
    var internalFormat = gl.RGBA;
    var width = 1;
    var height = 1;
    var border = 0;
    var srcFormat = gl.RGBA;
    var srcType = gl.UNSIGNED_BYTE;
    var pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    var image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & value - 1) == 0;
}