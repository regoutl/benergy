import PaletteTexture from './palettetexture.js';

function createShader (gl, sourceCode, type) {
  // Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
  var shader = gl.createShader( type );
  gl.shaderSource( shader, sourceCode );
  gl.compileShader( shader );

  if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
    var info = gl.getShaderInfoLog( shader );
    throw 'Could not compile WebGL program. \n\n' + info;
  }
  return shader;
}

function createProgram(gl, src, attribs){
  let program = gl.createProgram();

  // Attach pre-existing shaders
  gl.attachShader(program, createShader(gl, src[0], gl.VERTEX_SHADER));
  gl.attachShader(program,  createShader(gl, src[1], gl.FRAGMENT_SHADER));

  gl.bindAttribLocation(program, 0, 'a_position');

  gl.linkProgram(program);

  if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
    var info = gl.getProgramInfoLog(program);
    throw 'Could not compile WebGL program. \n\n' + info;
  }
    return program;
}


function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
		img.crossOrigin = '';
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", err => reject(err));
    img.src = src;
  });
}

/*function newCanvas(name, im, zindex, visible){
  let yo;
  let canvas = $(
    '<canvas id="'+name
                          + '" width="1374" height="1183"></canvas>');
  let ctx = canvas[0].getContext("2d");
  ctx.drawImage(im, 0, 0);
  canvas.imData = ctx.getImageData(0, 0, 1374, 1183);
  canvas.pixVal = new Uint32Array(
                              canvas.imData.data.buffer);
  ctx.clearRect(0, 0,
      canvas[0].width,
      canvas[0].height);
  ctx.putImageData(canvas.imData,0,0);
  canvas['Im'] = im;
  canvas.css({
    'z-index':zindex,
    visibility: (visible?'visible':'hidden'),
    position: 'fixed'});
  $('#dMap').append(canvas);
  return canvas;
}
*/

export default class MapDrawer{
  currentShowGrid = {'groundUse':true, 'energyGrid':true, 'flows':false};

  constructor(arg){
    this.nuke = [];

    this.cTop = $('<canvas width="1374" height="1183"></canvas>');
    this.cTop.css({
      'z-index': 99, position: 'fixed'
    });
    $('#dMap').append(this.cTop);

    this.cTop[0].getContext("2d").globalAlpha = 0.6;


    this._setGridLayerCheckbox();

    this.c = $('<canvas id="wololo" width="1374" height="1183"></canvas>');
    this.c.css({
      'z-index':10,
      position: 'fixed'});
    $('#dMap').append(this.c);

    this.gl = this.c[0].getContext("webgl", { alpha: false });

    this._createProg();

    this.energySrc = arg.energy;
    this.groundUseSrc = arg.groundUse;
    this._initTextures();

    this.draw();


    //represent the nursor for nuke
    this._nukeCursorNode = $('<img src="res/icons/nuke.png" class="scaleInvariant energyRelated" width="16px"/>');
    this._nukeCursorNode.css('display', 'none');
    $('#dMap').append(this._nukeCursorNode);


    this._initEvents();
  }

  /** @brief draw the currenty visible layers*/
  draw(){
    let gl = this.gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(1, 1, 1, 1);
    this.clear();
    if(this.currentShowGrid.groundUse)
      this._drawTex(this.groundUse);
    if(this.currentShowGrid.energyGrid)
      this._drawTex(this.energy);

    if(this.water && (this._nukeCursorNode.css('display') == 'block' ||this.currentShowGrid.flows))
      this._drawTex(this.water);
  }

  /** @brief update the given layer*/
  update(layerName){
    if(layerName != 'energy')
      throw 'olala';
    this.energy.update(this.energySrc);
  }

  /** @brief draw a cursor */
  drawCircle(x,y,radius) {
    const ctx = this.cTop[0].getContext('2d');
    ctx.clearRect(0, 0,
        this.cTop[0].width,
        this.cTop[0].height);

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2*Math.PI, true);
    ctx.fill();
  }
  drawNukeCursor(pos){
    this._nukeCursorNode.css({top:pos.y-10, left:pos.x - 8, display: 'block'});
    this.draw();
  }
  clearCursor(){
    const ctx = this.cTop[0].getContext('2d');
    ctx.clearRect(0, 0,
        this.cTop[0].width,
        this.cTop[0].height);
    //clear nuke cursor
    this._nukeCursorNode.css({ display: 'none'});
    this.draw();
  }

  addNuke(pos){
    let node = $('<img src="res/icons/nuke.png" class="scaleInvariant energyRelated" width="16px"/>');
    node.css({top:pos.y-10, left:pos.x - 8});
    $('#dMap').append(node);


    this.nuke.push({pos:pos, node:node});
  }


  //call
  on(eventType, callback){
    if(this._eventCallback[eventType] !== null)
      throw 'un seul a la fois';

    this._eventCallback[eventType] = callback;
  }


  _initEvents(){
    this._eventCallback = {click:null, pointerleave:null,mousemove:null};

    let self = this;
    $(function(){
      //on click on the grid
      $('#dCentralArea').on('click', function(){
        if($(this).data('moving'))
          return;
        self._eventCallback['click']();
      });

      self.cTop.on('pointerleave', function(){
        self._eventCallback['pointerleave']();
      });

      self.cTop.on('mousemove', function(evt){
        self._eventCallback['mousemove'](evt);
      });
    });

  }

  _createProg(){
    let vert = `
    attribute vec4 a_position;
    varying vec2 v_texcoord;
    void main() {
      gl_Position = a_position;

      // assuming a unit quad for position we
      // can just use that for texcoords. Flip Y though so we get the top at 0
      v_texcoord = a_position.xy * vec2(0.5, -0.5) + 0.5;
    }
    `;

    let frag = `
    precision mediump float;
    varying vec2 v_texcoord;
    uniform sampler2D u_image;
    uniform sampler2D u_palette;

    void main() {
        vec2 palXY = texture2D(u_image, v_texcoord).ra * 255.0;
        gl_FragColor = texture2D(u_palette, (palXY + vec2(0.5)) / 256.0);
    }
    `;


    let gl = this.gl; //shortcut


    this.prog = createProgram(gl, [vert, frag]);


    this.imageLoc = gl.getUniformLocation(this.prog, "u_image");
    this.paletteLoc = gl.getUniformLocation(this.prog, "u_palette");

    // Setup a unit quad
    let positions = [
          1,  1,
         -1,  1,
         -1, -1,
          1,  1,
         -1, -1,
          1, -1,
    ];
    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  _initTextures(){
    this.energy = new PaletteTexture(this.gl, 2);
    this.energy.appendPalette(0, 0, 0, 0);//index 0 is transparent
    this.energy.update(this.energySrc);

    this.groundUse = new PaletteTexture(this.gl, 1);

    this.groundUse.appendPalette(0, 0, 0, 0); //exterior
    this.groundUse.appendPalette(120, 120, 120);//airport
    this.groundUse.appendPalette(114, 122, 74/*183, 191, 154*/);//field
    this.groundUse.appendPalette(59, 85, 48/*52, 76, 45*/); //forest
    this.groundUse.appendPalette(120, 120, 97); //indus
    this.groundUse.appendPalette(137, 141, 131); // city
    this.groundUse.appendPalette(89, 109, 44/*120, 124, 74*/); //field
    this.groundUse.appendPalette(100, 140, 146);//water
    this.groundUse.appendPalette(52, 76, 45); //forest2
    this.groundUse.appendPalette(0, 0, 0); //?

    this.groundUse.update(this.groundUseSrc);

    let self = this;
    fetch('hydro/manuWater.bin')
    .then((response) => {return response.arrayBuffer();})
    .then((waterData) => {
      self.water = new PaletteTexture(self.gl, 1);
      self.water.appendPalette(0, 0, 255, 0); // j'ai  presque honte
      for(let i = 1; i < 256; i++)
        self.water.appendPalette(0, 0, 255, i); // j'ai  presque honte

      let arr= new Uint8Array(waterData);
      self.water.update(arr);
    })
    .catch(()=>{
      alert('prob load water');
    });
  }

  clear(){
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  _drawTex(paletteTexture){
    let gl = this.gl; //shortcut

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture.texture);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, paletteTexture.palette.tex);

    gl.useProgram(this.prog);
    gl.uniform1i(this.imageLoc, 0);
    gl.uniform1i(this.paletteLoc, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }


  _setGridLayerCheckbox() {
    let layers = ['energyGrid', 'flows'];

    let grid = this;
    layers.forEach((m) => {
        let checkbox = $('<label>' + '<input type="checkbox"'+
            'name="' + m + '"' + ' value="'+ m + '"' +
            (this.currentShowGrid[m] ? 'checked':'') + '> ' +
            m + '</label><br>');
        $('#gridLayers').append(checkbox);
        $('#gridLayers input:checkbox').on('change',
        function() {
          grid.currentShowGrid[$(this).val()] = $(this).is(':checked');
          grid.draw();
          if($(this).val() == 'energyGrid'){
            $('.energyRelated').css('opacity', $(this).is(':checked') ? 1.0: 0);
          }
        });
    });
  }

  _nrg2color(nrj, year){
      if(nrj == 'pv'){
          return {red:0, green:year-2000, blue:250, alpha:150};
      }
      return {red:255, green:255, blue:255, alpha:100};
  }

};




let mousePos = {x: 0, y:0};
let transform = {x: -0, y: -0, scale:0.64};
$('#dMap').css('transform', 'scale(' + transform.scale + ') translate(' + transform.x + 'px,' + transform.y + 'px)');

let dCentral = $("#dCentralArea");
dCentral.data('moving', false);

/// view control facilities----------------------------------------------------
export function enableAreaMoving(){
  dCentral.on("wheel", onWheel);
  dCentral.on("mousedown", onMouseDown);
  $('body').on("mouseup", onMouseUp);
}

export function disableAreaMoving(){
  dCentral.off("wheel", onWheel);
  dCentral.off("mousedown", onMouseDown);
  $('body').off("mouseup", onMouseUp);
}

function onWheel(e){
  var curX = e.originalEvent.pageX - dCentral.offset().left;
  var curY = e.originalEvent.pageY - dCentral.offset().top;


  var origin = {x: (curX  / transform.scale- transform.x), y: (curY  / transform.scale- transform.y)}

  if(e.originalEvent.deltaY > 0){
    transform.scale *= 0.8;
  }
  else{
    transform.scale /= 0.8;
  }

  //bounds
  transform.scale = Math.max(transform.scale, Math.pow(0.8, 4)); //unzoom
  transform.scale = Math.min(transform.scale, Math.pow(1/0.8, 8));//zoom

  transform.x = curX / transform.scale - origin.x;
  transform.y = curY / transform.scale - origin.y;


  $('#dMap').css('transform', 'scale(' + transform.scale + ') translate(' + transform.x + 'px,' + transform.y + 'px)');
  $('.scaleInvariant').css('transform', 'scale(' + (1/transform.scale) + ')');
}

function onMouseDown(e){
  mousePos.x = e.screenX;
  mousePos.y = e.screenY;

  $('body').mousemove(function(e){
    transform.x += (e.screenX - mousePos.x) / transform.scale;
    transform.y += (e.screenY - mousePos.y) / transform.scale;

    mousePos.x = e.screenX;
    mousePos.y = e.screenY;
    dCentral.data('moving', true);

    $('#dMap').css('transform', 'scale(' + transform.scale + ') translate(' + transform.x + 'px,' + transform.y + 'px)');
  });
}
function onMouseUp(e){
  setTimeout(() => {
    dCentral.data('moving', false);
  }, 1);
  $('body').off('mousemove');
}