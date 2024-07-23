Overview
MyUI is a lightweight UI framework for creating and managing interactive components on a canvas. It supports draggable components, click events, and various customizable UI elements like buttons, text boxes, and sliders.

Getting Started
To use the MyUI library, you need to create an HTML canvas element and initialize the Canvas class with it. Then, you can create and manipulate UI components by adding them to the canvas.

Setup
Include the Script: Ensure that you have included the MyUI script in your HTML file.
html
<script src="path/to/your/myui.js"></script>
Create a Canvas: Add a canvas element to your HTML.
html
<canvas id="myCanvas" width="800" height="600"></canvas>
Initialize the Canvas: Create a new instance of the Canvas class with your canvas element.
javascript
const canvasElement = document.getElementById('myCanvas');
const myCanvas = new MyUI.Canvas(canvasElement);
Components
1. Component

The Component class is the base class for all UI elements. It provides basic functionalities such as positioning, dragging, and event handling.

Constructor: Initializes the component with position, size, and color.
Methods:
draw(ctx): Draws the component on the canvas.
add(component): Adds a child component.
moveTo(pos): Moves the component to a new position.
moveBy(pos): Moves the component by a relative position.
setState(newState): Updates the component's state.
setProps(newProps): Updates the component's properties.
startDragging(event): Starts dragging the component.
handleDragging(event): Handles dragging events.
stopDragging(): Stops dragging the component.
2. Button

The Button class extends Component and represents a clickable button.

Constructor: Initializes the button with a label and color.
Methods:
draw(ctx): Draws the button with a label.
handleMouseEvent(eventType, event): Handles mouse events, including click.
3. TextBox

The TextBox class extends Component and represents a text input box.

Constructor: Initializes the text box with text, color, and editable state.
Methods:
draw(ctx): Draws the text box and its text.
handleMouseEvent(eventType, event): Handles mouse events and toggles editing mode.
handleKeyDown(event): Handles keyboard input for text editing.
getValue(): Returns the current text value.
4. Slider

The Slider class extends Component and represents a slider input.

Constructor: Initializes the slider with minimum, maximum values, and current value.
Methods:
draw(ctx): Draws the slider with a handle.
isPointInside(x, y): Checks if a point is inside the slider's handle.
startDragging(event): Starts dragging the slider handle.
handleDragging(event): Handles dragging of the slider handle and updates the value.
Example Usage
Here’s a complete example demonstrating how to use the MyUI library to create a button, text box, and slider on a canvas.

html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyUI Example</title>
</head>
<body>
  <canvas id="myCanvas" width="800" height="600"></canvas>
  <script src="path/to/your/myui.js"></script>
  <script>
    const canvasElement = document.getElementById('myCanvas');
    const myCanvas = new MyUI.Canvas(canvasElement);

    // Create and add a button
    const button = new MyUI.Button(50, 50, 150, 50, 'Click Me');
    button.onClick = () => alert('Button Clicked!');
    myCanvas.addComponent(button);

    // Create and add a text box
    const textBox = new MyUI.TextBox(50, 120, 200, 50, 'Editable Text', 'black', 'lightyellow', true);
    myCanvas.addComponent(textBox);

    // Create and add a slider
    const slider = new MyUI.Slider(50, 200, 200, 30, 0, 100, 50, 20);
    slider.onValueChange = (value) => console.log('Slider value:', value);
    myCanvas.addComponent(slider);

    // Draw the canvas
    function animate() {
      myCanvas.doOneCycle();
      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>

API Reference
MyUI.Canvas

Constructor: new MyUI.Canvas(canvasElement)
Methods:
addComponent(component): Adds a component to the canvas.
removeComponent(component): Removes a component from the canvas.
doOneCycle(): Clears and redraws all components.
MyUI.Component

Constructor: new MyUI.Component(x, y, width, height, color)
Methods:
draw(ctx): Draws the component.
add(component): Adds a child component.
moveTo(pos): Moves the component to a new position.
moveBy(pos): Moves the component by a relative position.
setState(newState): Updates the component's state.
setProps(newProps): Updates the component's properties.
startDragging(event): Starts dragging.
handleDragging(event): Handles dragging.
stopDragging(): Stops dragging.
isPointInside(x, y): Checks if a point is inside the component.
MyUI.Button

Constructor: new MyUI.Button(x, y, width, height, label, color)
Methods:
draw(ctx): Draws the button.
handleMouseEvent(eventType, event): Handles mouse events.
MyUI.TextBox

Constructor: new MyUI.TextBox(x, y, width, height, text, textColor, color, editable)
Methods:
draw(ctx): Draws the text box.
handleMouseEvent(eventType, event): Handles mouse events.
handleKeyDown(event): Handles keyboard input.
getValue(): Gets the text value.
MyUI.Slider

Constructor: new MyUI.Slider(x, y, width, height, min, max, value, handleSize)
Methods:
draw(ctx): Draws the slider.
isPointInside(x, y): Checks if a point is inside the slider handle.
startDragging(event): Starts dragging.
handleDragging(event): Handles dragging.
