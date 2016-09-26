
CircularGridHelper = function ( diameter, step , upVector, color, opacity, text, textColor, textPosition, marginSize) {

      defaults = {
        diameter: 200,
        step: 100,
        color: 0xFFFFFF,
        opacity: 0.1,
        addText: true,
        textColor: "#FFFFFF",
        textLocation: "f",
        rootAssembly: null
      };
      THREE.Object3D.call( this );

      this.diameter     = diameter || 200;
      this.step         = step || 100;
      this.color        = color ||  0x00baff;
      this.opacity      = opacity || 0.2;
      this.text         = text || true;
      this.textColor    = textColor || "#000000";
      this.textPosition = "center";
      this.upVector     = upVector || new THREE.Vector3(0,1,0);

      this.name = "grid";

      //TODO: clean this up
      this.marginSize = ('number' === typeof marginSize ? marginSize : 10);
      this.stepSubDivisions = 10;


      this._drawGrid();

      //default grid orientation is z up, rotate if not the case
      var upVector = this.upVector;
      this.up = upVector;
      this.lookAt(upVector);
};

CircularGridHelper.prototype = Object.create( THREE.Object3D.prototype );

CircularGridHelper.prototype._drawGrid = function() {
      var gridGeometry, gridMaterial, mainGridZ, planeFragmentShader, planeGeometry, planeMaterial, subGridGeometry, subGridMaterial, subGridZ;

      //offset to avoid z fighting
      mainGridZ = -0.05;
      gridGeometry = new THREE.Geometry();
      gridMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHex(this.color),
        opacity: this.opacity,
        linewidth: 2,
        transparent: true
      });

      subGridZ = -0.05;
      subGridGeometry = new THREE.Geometry();
      subGridMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHex(this.color),
        opacity: this.opacity / 2,
        transparent: true
      });

      var step = this.step;
      var stepSubDivisions = this.stepSubDivisions;
      var diameter = this.diameter;
      var radius = diameter/2;
      var width = this.diameter;
      var length = this.diameter;

      var centerBased = true


      function getStart( offset ){
        var angle = Math.asin( offset / radius );

        var start = Math.cos( angle ) * radius;
        return start
      }


      if(centerBased)
      {
        for (var i = 0; i <= width/2; i += step/stepSubDivisions)
        {
          var start = getStart( i );

          subGridGeometry.vertices.push( new THREE.Vector3(-start, i, subGridZ) );
          subGridGeometry.vertices.push( new THREE.Vector3(start, i, subGridZ) );

          subGridGeometry.vertices.push( new THREE.Vector3(-start, -i, subGridZ) );
          subGridGeometry.vertices.push( new THREE.Vector3(start, -i, subGridZ) );

          if( i%step == 0 )
          {
            gridGeometry.vertices.push( new THREE.Vector3(-start, i, mainGridZ) );
            gridGeometry.vertices.push( new THREE.Vector3(start, i, mainGridZ) );

            gridGeometry.vertices.push( new THREE.Vector3(-start, -i, mainGridZ) );
            gridGeometry.vertices.push( new THREE.Vector3(start, -i, mainGridZ) );
          }
        }
        for (var i = 0; i <= length/2; i += step/stepSubDivisions)
        {
          var start = getStart( i );
          subGridGeometry.vertices.push( new THREE.Vector3(i, -start, subGridZ) );
          subGridGeometry.vertices.push( new THREE.Vector3(i, start, subGridZ) );

          subGridGeometry.vertices.push( new THREE.Vector3(-i, -start, subGridZ) );
          subGridGeometry.vertices.push( new THREE.Vector3(-i, start, subGridZ) );

          if( i%step == 0 )
          {
            gridGeometry.vertices.push( new THREE.Vector3(i, -start, mainGridZ) );
            gridGeometry.vertices.push( new THREE.Vector3(i, start, mainGridZ) );

            gridGeometry.vertices.push( new THREE.Vector3(-i, -start, mainGridZ) );
            gridGeometry.vertices.push( new THREE.Vector3(-i, start, mainGridZ) );
          }
        }
      }
      //create main & sub grid objects
      this.mainGrid = new THREE.LineSegments(gridGeometry, gridMaterial);
      this.subGrid = new THREE.LineSegments(subGridGeometry, subGridMaterial);

      //create margin
      var offsetWidth  = width + this.marginSize;
      var offsetLength = length + this.marginSize;
      var segments = 128;

      var marginGeometry = new THREE.CircleGeometry( diameter/2 + this.marginSize/2 , segments );
      var marginGeometry2 = new THREE.CircleGeometry( diameter/2 , segments );

      marginGeometry.vertices.shift();
      marginGeometry2.vertices.shift();
      marginGeometry.merge( marginGeometry2 );

      var strongGridMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHex(this.color),
        opacity: this.opacity*2,
        linewidth: 2,
        transparent: true
      });
      this.margin = new THREE.Line(marginGeometry, strongGridMaterial);

      //add all grids, subgrids, margins etc
      this.add( this.mainGrid );
      this.add( this.subGrid );
      this.add( this.margin );

      //this._drawNumbering();
};


CircularGridHelper.prototype.toggle = function(toggle) {
  //apply visibility settings to all children
      this.traverse( function( child ) {
        child.visible = toggle;
      });
};

CircularGridHelper.prototype.setOpacity = function(opacity) {
      this.opacity = opacity;
      this.mainGrid.material.opacity = opacity;
      this.subGrid.material.opacity = opacity/2;
      this.margin.material.opacity = opacity*2;
};

CircularGridHelper.prototype.setColor = function(color) {
      this.color = color;
      this.mainGrid.material.color = new THREE.Color().setHex(this.color);
      this.subGrid.material.color = new THREE.Color().setHex(this.color);
      this.margin.material.color = new THREE.Color().setHex(this.color);
};


CircularGridHelper.prototype.toggleText = function(toggle) {
  this.text = toggle;
  var labels = this.labels.children;
  for (var i = 0; i < this.labels.children.length; i++) {
    var label = labels[i];
    label.visible = toggle;
  }
};

CircularGridHelper.prototype.setTextColor = function(color) {
  this.textColor = color;
  this._drawNumbering();
};

CircularGridHelper.prototype.setTextLocation = function(location) {
  this.textLocation = location;
  return this._drawNumbering();
};

CircularGridHelper.prototype.setUp = function(upVector) {
  this.upVector = upVector;
  this.up = upVector;
  this.lookAt(upVector);
};

CircularGridHelper.prototype.resize = function( width, length ) {
  if (width && length ) {
    var width = Math.max(width,10);
    this.diameter = width;

    var length = Math.max(length,10);
    this.length = length;

    this.step = Math.max(this.step,5);

    this.remove(this.mainGrid);
    this.remove(this.subGrid);
    this.remove( this.margin );
    //this.remove(this.plane);
    return this._drawGrid();
  }
};

CircularGridHelper.prototype._drawNumbering = function() {
      var label, sizeLabel, sizeLabel2, xLabelsLeft, xLabelsRight, yLabelsBack, yLabelsFront;
      var step = this.step;

      this._labelStore = {};

      if (this.labels != null) {
        this.mainGrid.remove(this.labels);
      }
      this.labels = new THREE.Object3D();


      var width = this.width;
      var length = this.length;
      var numbering = this.numbering = "centerBased";

      var labelsFront = new THREE.Object3D();
      var labelsSideRight = new THREE.Object3D();

      if(numbering == "centerBased" )
      {
        for (var i = 0 ; i <= width/2; i += step)
        {
          var sizeLabel = this.drawTextOnPlane("" + i, 32);
          var sizeLabel2 = sizeLabel.clone();

          sizeLabel.position.set(length/2, -i, 0.1);
          sizeLabel.rotation.z = -Math.PI / 2;
          labelsFront.add( sizeLabel );

          sizeLabel2.position.set(length/2, i, 0.1);
          sizeLabel2.rotation.z = -Math.PI / 2;
          labelsFront.add( sizeLabel2 );
        }

        for (var i = 0 ; i <= length/2; i += step)
        {
          var sizeLabel = this.drawTextOnPlane("" + i, 32);
          var sizeLabel2 = sizeLabel.clone();

          sizeLabel.position.set(-i, width/2, 0.1);
          //sizeLabel.rotation.z = -Math.PI / 2;
          labelsSideRight.add( sizeLabel );

          sizeLabel2.position.set(i, width/2, 0.1);
          //sizeLabel2.rotation.z = -Math.PI / 2;
          labelsSideRight.add( sizeLabel2 );
        }

        labelsSideLeft = labelsSideRight.clone();
        labelsSideLeft.rotation.z = -Math.PI ;
        //labelsSideLeft = labelsSideRight.clone().translateY(- width );

        labelsBack = labelsFront.clone();
        labelsBack.rotation.z = -Math.PI ;
      }



      /*if (this.textLocation === "center") {
        yLabelsRight.translateY(- length/ 2);
        xLabelsFront.translateX(- width / 2);
      } else {
        yLabelsLeft = yLabelsRight.clone().translateY( -width );
        xLabelsBack = xLabelsFront.clone().translateX( -length );

        this.labels.add( yLabelsLeft );
        this.labels.add( xLabelsBack) ;
      }*/
      //this.labels.add( yLabelsRight );
      this.labels.add( labelsFront );
      this.labels.add( labelsBack );

      this.labels.add( labelsSideRight );
      this.labels.add( labelsSideLeft );


      //apply visibility settings to all labels
      var textVisible = this.text;
      this.labels.traverse( function( child  ) {
        child.visible = textVisible;
      });


      this.mainGrid.add(this.labels);
};

CircularGridHelper.prototype.drawTextOnPlane = function(text, size) {
  var canvas, context, material, plane, texture;

  if (size == null) {
    size = 256;
  }

  canvas = document.createElement('canvas');
  var size = 128;
  canvas.width = size;
  canvas.height = size;
  context = canvas.getContext('2d');
  context.font = "18px sans-serif";
  context.textAlign = 'center';
  context.fillStyle = this.textColor;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  context.strokeStyle = this.textColor;
  context.strokeText(text, canvas.width / 2, canvas.height / 2);

  texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
      texture.generateMipmaps = true;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;

  material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    color: 0xffffff,
    alphaTest: 0.3
  });
  plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(size / 8, size / 8), material);
  plane.doubleSided = true
  plane.overdraw = true

  return plane;

};


//autoresize, disabled for now
/*
CircularGridHelper.prototype.updateGridSize = function() {
      var max, maxX, maxY, min, minX, minY, size, subchild, _getBounds, _i, _len, _ref,
        _this = this;
      minX = 99999;
      maxX = -99999;
      minY = 99999;
      maxY = -99999;
      _getBounds = function(mesh) {
        var bBox, subchild, _i, _len, _ref, _results;
        if (mesh instanceof THREE.Mesh) {
          mesh.geometry.computeBoundingBox();
          bBox = mesh.geometry.boundingBox;
          minX = Math.min(minX, bBox.min.x);
          maxX = Math.max(maxX, bBox.max.x);
          minY = Math.min(minY, bBox.min.y);
          maxY = Math.max(maxY, bBox.max.y);
          _ref = mesh.children;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            subchild = _ref[_i];
            _results.push(_getBounds(subchild));
          }
          return _results;
        }
      };
      if (this.rootAssembly != null) {
        _ref = this.rootAssembly.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          subchild = _ref[_i];
          if (subchild.name !== "renderSubs" && subchild.name !== "connectors") {
            _getBounds(subchild);
          }
        }
      }
      max = Math.max(Math.max(maxX, maxY), 100);
      min = Math.min(Math.min(minX, minY), -100);
      size = (Math.max(max, Math.abs(min))) * 2;
      size = Math.ceil(size / 10) * 10;
      if (size >= 200) {
        return this.resize(size);
      }
};
*/
