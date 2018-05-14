
var state = {
	ratio: 2,
	event:{
		x: null,
		y: null,
		lastX: null,
		lastY: null,
		target: null
	},
	mousemove: null,
	mouseup: null

}
const body = document.querySelector("body")
body.addEventListener("mousedown", event => {
	state.event.x = event.offsetX
	state.event.y = event.offsetY
})

body.addEventListener("mousemove", event => {
	if(state.mousemove){
		state.event.lastX = state.event.x
		state.event.lastY = state.event.y
		state.event.x = event.offsetX
		state.event.y = event.offsetY
		state.mousemove(state.event)
	}
})
body.addEventListener("mouseup", event => {
	state.event.target = event.target
	if(state.mouseup){
		state.mouseup(state.event)
	}
	state.mousemove = null
	state.mouseup = null
	state.event = {
		x: null,
		y: null,
		lastX: null,
		lastY: null,
		mouseoverTarget: null
	}
})

export default state