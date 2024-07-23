const MyUI = (() => {
  class Pos {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }

  class Component {
    constructor(x, y, width, height, color = 'gray') {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this._color = color;
      this.isDraggable = false;
      this.children = [];
      this.state = {};
      this.props = {};
      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.parent = null;
      this.offsetX = 0;
      this.offsetY = 0;
      this.followParentOffset = true;
      this.rotation = 0;
      this.init();
    }

    get color() {
      return this._color;
    }

    set color(value) {
      this._color = value;
    }

    draw(ctx) {
      const [drawX, drawY] = this.getAbsolutePosition();
      ctx.save();
      ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.strokeStyle = 'black';
      ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
      this.children.forEach(child => child.drawNew(ctx));
    }

    drawNew(ctx) {
      this.draw(ctx);
    }

    getAbsolutePosition() {
      let absX = this.x;
      let absY = this.y;
      let currentParent = this.parent;
      while (currentParent) {
        if (this.followParentOffset) {
          absX += currentParent.x;
          absY += currentParent.y;
        }
        currentParent = currentParent.parent;
      }
      return [absX, absY];
    }

    startDragging(event) {
      if (!this.isDraggable) return;
      this.isDragging = true;
      const canvas = event.target;
      const canvasRect = canvas.getBoundingClientRect();
      const touch = event.touches ? event.touches[0] : event;
      const [absX, absY] = this.getAbsolutePosition();
      this.dragStartX = touch.clientX - canvasRect.left - absX;
      this.dragStartY = touch.clientY - canvasRect.top - absY;
    }

    handleDragging(event) {
      if (!this.isDraggable) return;
      if (this.isDragging) {
        event.preventDefault();
        const canvas = event.target;
        const canvasRect = canvas.getBoundingClientRect();
        const touch = event.touches ? event.touches[0] : event;
        const newX = touch.clientX - canvasRect.left - this.dragStartX;
        const newY = touch.clientY - canvasRect.top - this.dragStartY;
        this.moveTo(new Pos(newX, newY));
        this.componentDidUpdate();
      }
    }

    stopDragging() {
      this.isDragging = false;
    }

    handleMouseEvent(eventType, event) {
      switch (eventType) {
        case 'click':
        case 'touchend':
          if (this.onMouseClick) this.onMouseClick();
          break;
        case 'rightClick':
          if (this.onRightMouseClick) this.onRightMouseClick();
          break;
        case 'mousedown':
        case 'touchstart':
          this.startDragging(event);
          break;
      }
      this.children.forEach(child => child.handleMouseEvent(eventType, event));
    }

    add(component) {
      component.parent = this;
      component.offsetX = component.x - this.x;
      component.offsetY = component.y - this.y;
      this.children.push(component);
      this.componentDidUpdate();
    }

    moveTo(pos) {
      const deltaX = pos.x - this.x;
      const deltaY = pos.y - this.y;
      this.x = pos.x;
      this.y = pos.y;
      this.children.forEach(child => {
        if (child.followParentOffset) {
          child.moveBy(new Pos(deltaX, deltaY));
        }
      });
      this.componentDidUpdate();
    }

    moveBy(pos) {
      this.x += pos.x;
      this.y += pos.y;
      this.children.forEach(child => {
        if (child.followParentOffset) {
          child.moveBy(pos);
        }
      });
      this.componentDidUpdate();
    }

    setState(newState) {
      const prevState = { ...this.state };
      this.state = { ...this.state, ...newState };
      this.componentDidUpdate(prevState, this.state);
    }

    setProps(newProps) {
      const prevProps = { ...this.props };
      this.props = { ...this.props, ...newProps };
      this.componentDidUpdate(prevProps, this.props);
    }

    init() {
      this.componentDidMount();
    }

    componentDidMount() {}

    componentDidUpdate(prevStateOrProps, newStateOrProps) {}

    componentWillUnmount() {}

    disableParentOffsetFollowing() {
      this.followParentOffset = false;
    }

    enableParentOffsetFollowing() {
      this.followParentOffset = true;
    }

    isPointInside(x, y) {
      const [absX, absY] = this.getAbsolutePosition();
      return (
        x >= absX &&
        x <= absX + this.width &&
        y >= absY &&
        y <= absY + this.height
      );
    }

    turn(angle) {
      this.rotation += angle;
    }

    resize(newWidth, newHeight) {
      this.width = newWidth;
      this.height = newHeight;
    }
  }

  class Canvas {
    constructor(canvasElement) {
      this.ctx = canvasElement.getContext('2d');
      this.components = [];
      this.setupEventListeners(canvasElement);
      this.draggedComponent = null;
    }

    setupEventListeners(canvasElement) {
      canvasElement.addEventListener('touchstart', (e) => this.handleEvent('touchstart', e), { passive: false });
      canvasElement.addEventListener('touchmove', (e) => this.handleEvent('touchmove', e), { passive: false });
      canvasElement.addEventListener('touchend', (e) => this.handleEvent('touchend', e), { passive: false });
      canvasElement.addEventListener('mousedown', (e) => this.handleEvent('mousedown', e));
      canvasElement.addEventListener('mousemove', (e) => this.handleEvent('mousemove', e));
      canvasElement.addEventListener('mouseup', (e) => this.handleEvent('mouseup', e));
      canvasElement.addEventListener('click', (e) => this.handleEvent('click', e));
    }

    handleEvent(type, event) {
      event.preventDefault();
      const { clientX, clientY } = event.touches ? event.touches[0] : event;
      const canvasRect = event.target.getBoundingClientRect();
      const x = clientX - canvasRect.left;
      const y = clientY - canvasRect.top;

      if (type === 'touchstart' || type === 'mousedown') {
        this.draggedComponent = this.findComponentAt(x, y);
        if (this.draggedComponent) {
          this.draggedComponent.startDragging(event);
        }
      } else if (type === 'touchmove' || type === 'mousemove') {
        if (this.draggedComponent) {
          this.draggedComponent.handleDragging(event);
        }
      } else if (type === 'touchend' || type === 'mouseup') {
        if (this.draggedComponent) {
          this.draggedComponent.stopDragging();
          this.draggedComponent = null;
        }
      } else if (type === 'click') {
        const clickedComponent = this.findComponentAt(x, y);
        if (clickedComponent) {
          clickedComponent.handleMouseEvent('click', event);
        }
      }
    }

    findComponentAt(x, y) {
      for (let i = this.components.length - 1; i >= 0; i--) {
        const component = this.components[i];
        if (component.isPointInside(x, y)) {
          return component;
        }
      }
      return null;
    }

    addComponent(component) {
      this.components.push(component);
    }

    removeComponent(component) {
      const index = this.components.indexOf(component);
      if (index > -1) {
        this.components.splice(index, 1);
        component.componentWillUnmount();
      }
    }

    doOneCycle() {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.components.forEach(component => component.drawNew(this.ctx));
    }
  }

  class Button extends Component {
    constructor(x, y, width, height, label = '', color = 'lightgray') {
      super(x, y, width, height, color);
      this.label = label;
      this.onClick = null;
      this.isPressed = false;
      this.isDraggable = false;
    }

    draw(ctx) {
      const [drawX, drawY] = this.getAbsolutePosition();
      ctx.save();
      ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.isPressed ? this.darkenColor(this.color) : this.color;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.strokeStyle = 'black';
      ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
      
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, 0, 0);
      ctx.restore();
    }

    darkenColor(color) {
      const rgb = parseInt(color.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >>  8) & 0xff;
      const b = (rgb >>  0) & 0xff;
      return `rgb(${r * 0.8},${g * 0.8},${b * 0.8})`;
    }

    handleMouseEvent(eventType, event) {
      super.handleMouseEvent(eventType, event);
      
      if (eventType === 'mousedown' || eventType === 'touchstart') {
        this.isPressed = true;
      } else if (eventType === 'mouseup' || eventType === 'touchend' || eventType === 'click') {
        if (this.isPressed && this.isPointInside(event.offsetX, event.offsetY)) {
          if (this.onClick) {
            this.onClick();
          }
        }
        this.isPressed = false;
      }
    }
  }

  class TextBox extends Component {
    constructor(x, y, width, height, text = '', textColor = 'black', color = 'white', editable = false) {
      super(x, y, width, height, color);
      this.text = text;
      this.textColor = textColor;
      this.editable = editable;
      this.isEditing = false;
      this.cursorPosition = this.text.length;
    }

    draw(ctx) {
      super.draw(ctx);
      const [drawX, drawY] = this.getAbsolutePosition();
      ctx.save();
      ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.textColor;
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      // Draw text
      const displayText = this.text.substring(0, this.cursorPosition) + 
                          (this.isEditing ? '|' : '') + 
                          this.text.substring(this.cursorPosition);
      ctx.fillText(displayText, -this.width / 2 + 5, -this.height / 2 + 5, this.width - 10);

      // Draw editable indicator
      if (this.editable) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(this.width / 2 - 20, -this.height / 2, 20, this.height);
        ctx.fillStyle = this.textColor;
        ctx.fillText('✎', this.width / 2 - 15, -this.height / 2 + 5);
      }
      ctx.restore();
    }

    handleMouseEvent(eventType, event) {
      super.handleMouseEvent(eventType, event);
      
      if (eventType === 'click' && this.editable) {
        this.isEditing = !this.isEditing;
        if (this.isEditing) {
          document.addEventListener('keydown', this.handleKeyDown);
        } else {
          document.removeEventListener('keydown', this.handleKeyDown);
        }
      }
    }

    handleKeyDown = (event) => {
      if (this.isEditing) {
        if (event.key === 'Backspace') {
          if (this.cursorPosition > 0) {
            this.text = this.text.slice(0, this.cursorPosition - 1) + this.text.slice(this.cursorPosition);
            this.cursorPosition--;
          }
        } else if (event.key === 'ArrowLeft') {
          this.cursorPosition = Math.max(0, this.cursorPosition - 1);
        } else if (event.key === 'ArrowRight') {
          this.cursorPosition = Math.min(this.text.length, this.cursorPosition + 1);
        } else if (event.key.length === 1) {
          this.text = this.text.slice(0, this.cursorPosition) + event.key + this.text.slice(this.cursorPosition);
          this.cursorPosition++;
        }
      }
    }

    getValue() {
      return this.text;
    }
  }

  class Slider extends Component {
    constructor(x, y, width, height, min = 0, max = 100, value = 50, handleSize = 20) {
      super(x, y, width, height, 'lightgray');
      this.min = min;
      this.max = max;
      this.value = value;
      this.handleSize = handleSize;
      this.onValueChange = null;
      this.isDragging = false;
    }

    draw(ctx) {
      const [drawX, drawY] = this.getAbsolutePosition();
      ctx.save();
      ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
      ctx.rotate(this.rotation);
      
      // Draw bar
      ctx.fillStyle = '#ddd';
      ctx.fillRect(-this.width / 2, -2, this.width, 4);

      // Draw handle
      const handleX = ((this.value - this.min) / (this.max - this.min)) * (this.width - this.handleSize) - this.width / 2;
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(handleX + this.handleSize / 2, 0, this.handleSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#45a049';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw value
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(this.value), handleX + this.handleSize / 2, this.height / 2 + 15);
      
      ctx.restore();
    }

    isPointInside(x, y) {
      const [absX, absY] = this.getAbsolutePosition();
      const handleX = absX + ((this.value - this.min) / (this.max - this.min)) * (this.width - this.handleSize);
      return (
        x >= handleX &&
        x <= handleX + this.handleSize &&
        y >= absY &&
        y <= absY + this.height
      );
    }

    startDragging(event) {
      super.startDragging(event);
      this.isDragging = true;
    }

    handleDragging(event) {
      if (this.isDragging) {
        const canvas = event.target;
        const canvasRect = canvas.getBoundingClientRect();
        const touch = event.touches ? event.touches[0] : event;
        const [absX, absY] = this.getAbsolutePosition();
        const mouseX = touch.clientX - canvasRect.left - absX;
        const newValue = this.min + (mouseX / this.width) * (this.max - this.min);
        this.value = Math.min(Math.max(newValue, this.min), this.max);
        if (this.onValueChange) {
          this.onValueChange(this.value);
        }
      }
    }

    stopDragging() {
      super.stopDragging();
      this.isDragging = false;
    }

    getValue() {
      return this.value;
    }
  }

  class Box extends Component {
    draw(ctx) {
      super.draw(ctx);
    }
  }

  class CircleBox extends Component {
    draw(ctx) {
      const [drawX, drawY] = this.getAbsolutePosition();
      ctx.save();
      ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.stroke();
      ctx.restore();
    }
  }

  class Triangle extends Component {
    draw(ctx) {
      const [drawX, drawY] = this.getAbsolutePosition();
      ctx.save();
      ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(0, -this.height / 2);
      ctx.lineTo(this.width / 2, this.height / 2);
      ctx.lineTo(-this.width / 2, this.height / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.stroke();
      ctx.restore();
    }
  }

  class Pen extends Component {
    draw(ctx) {
      const [drawX, drawY] = this.getAbsolutePosition();
      ctx.save();
      ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.fillRect(-5, -this.height / 2, 10, this.height);
      ctx.strokeStyle = 'black';
      ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
    }
  }

  class Line extends Component {
    draw(ctx) {
      const [drawX, drawY] = this.getAbsolutePosition();
      ctx.save();
      ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.height;
      ctx.beginPath();
      ctx.moveTo(-this.width / 2, 0);
      ctx.lineTo(this.width / 2, 0);
      ctx.stroke();
      ctx.restore();
    }
  }

  class Frame extends Component {
    constructor(x, y, width, height, color = 'transparent') {
      super(x, y, width, height, color);
      this._components = [];
    }

    add(component) {
      component.parent = this;
      this._components.push(component);
      this.componentDidUpdate();
    }

    remove(component) {
      const index = this._components.indexOf(component);
      if (index > -1) {
        this._components.splice(index, 1);
        component.componentWillUnmount();
        this.componentDidUpdate();
      }
    }

    draw(ctx) {
      const [drawX, drawY] = this.getAbsolutePosition();
      ctx.save();
      ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
      this._components.forEach(component => component.drawNew(ctx));
    }
  }

  class Circle extends Component {
    constructor(x, y, radius, color = 'gray') {
      super(x, y, radius * 2, radius * 2, color);
      this.radius = radius;
    }

    draw(ctx) {
      const [drawX, drawY] = this.getAbsolutePosition();
      ctx.save();
      ctx.translate(drawX + this.radius, drawY + this.radius);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.stroke();
      ctx.restore();
    }
  }

  return {
    Pos,
    Component,
    Canvas,
    Button,
    TextBox,
    Slider,
    Box,
    CircleBox,
    Triangle,
    Pen,
    Line,
    Frame,
    Circle
  };
})();
