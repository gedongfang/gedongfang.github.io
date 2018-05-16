import drag from "./drag.js"

export {Parent, Line, render}


class Parent{
	constructor(x, y){
		this.x = x
		this.y = y
		this.width = 100
		this.height = 50
		this.rect = null
		this.childrenLeft = []
		this.childrenRight = []
		this.leftHeight = 0
		this.rightHeight = 0
		Parent.list.push(this)
	}
	reviseHeight(height,reviseDom){
		this.height += height
		if(this.rect && reviseDom){
			this.rect.height.baseVal.value = this.height
		}
	}
	addChildren(...children){
		this.reviseHeight(-Math.max(this.leftHeight, this.rightHeight))
		children.forEach(child => {
			if(child.line.getOtherChild(child).parent.x > this.x){
				this.childrenRight.push(child)
				this.rightHeight += 2 * child.height
			}else{
				this.childrenLeft.push(child)
				this.leftHeight += 2 * child.height
			}
			child.parent = this
		})
		this.reviseHeight(Math.max(this.leftHeight, this.rightHeight), true)
		this.updateChildrenPositionY()
	}
	removeChild(child){
		this.reviseHeight(-Math.max(this.leftHeight, this.rightHeight))
		if(this.childrenLeft.remove(child)){
			this.leftHeight -= 2 * child.height
		}else if(this.childrenRight.remove(child)){
			this.rightHeight -= 2 * child.height
		}
		this.reviseHeight(Math.max(this.leftHeight, this.rightHeight), true)
		this.updateChildrenPositionY()
	}
	createSvg(){
		const rect = createSvg('rect', {
	        width: this.width,
	        height: this.height,
	        fill: "#009ACD",
	        class: "parent",
	        transform: "translate(" + this.x + " " + this.y + ")"
	    })
		this.rect = rect
	    drag(rect).addEventListener("mousemove", event => {
	    	this.move(event.x - event.lastX, event.y - event.lastY)
	    })
	}
	move(x = 0, y = 0){
		this.x += x
		this.y += y
		if(this.rect){
			this.rect.transform.baseVal[0].matrix.e = this.x
			this.rect.transform.baseVal[0].matrix.f = this.y
		}
		this.updateChildrenPositionX()
		this.updateOtherChildPositionX()
	}
	updateOtherChildPositionX(child){
		const children = new Set()
		if(child){
			children.add(child)
		}else{	
			this.childrenLeft.forEach(child => children.add(child))
			this.childrenRight.forEach(child => children.add(child))
		}
		for (let child of children) {
			const otherChild = child.line.getOtherChild(child)
			const otherParent = otherChild.parent
			otherParent.removeChild(otherChild)
			otherParent.addChildren(otherChild)
		}
	}
	updateChildrenPositionX(){
		const left = this.childrenLeft
		const right = this.childrenRight
		this.reviseHeight(-Math.max(this.leftHeight, this.rightHeight))
		this.childrenLeft = []
		this.childrenRight = []
		this.leftHeight = 0
		this.rightHeight = 0
		this.addChildren(...left, ...right)
	}
	updateChildrenPositionY(){
		this.childrenSort(this.childrenLeft)
		this.childrenSort(this.childrenRight)
		let y = this.y + (this.height - Math.max(this.leftHeight, this.rightHeight)) / 2
		this.childrenLeft.forEach(child => {
			child.updatePosition(this.x - child.width / 2 , y)
			y += 2 * child.height 
		})
		y = this.y + (this.height - Math.max(this.leftHeight, this.rightHeight)) / 2
		this.childrenRight.forEach(child => {
			child.updatePosition(this.x + this.width - child.width / 2 , y)
			y += 2 * child.height 
		})
	}
	childrenSort(children){
		children.sort(function(childA,childB){
			let otherA = childA.line.getOtherChild(childA)
			let otherB = childB.line.getOtherChild(childB)
			return otherA.y - otherB.y
		})
	}
}
Parent.list = []

class Child{
	constructor(line, parent, fill){
		this.x = parent.x
		this.y = parent.y
		this.width = 20
		this.height = 15
		this.fill = fill
		this.parent = parent
		this.line = line
		this.rect = null
		Child.list.push(this)
	}
	createSvg(){
		const rect = createSvg('rect', {
	        width: this.width,
	        height: this.height,
	        fill: this.fill,
	        transform: "translate(" + this.x + " " + this.y + ")"
	    })
	    this.rect = rect
	    drag(rect).addEventListener("mousemove", event => {
	    	this.move(event.x - event.lastX, event.y - event.lastY)
	     	rect.style.pointerEvents = "none"
	    }).addEventListener("mouseup", event => {
    		rect.style.pointerEvents = ""
    		this.parent.removeChild(this)
    		if(event.target.className && event.target.className.baseVal === "parent"){
    			for(let i = 0; i < Parent.list.length; i++){
    				const parent = Parent.list[i]
    				if(parent.rect === event.target){
    					if(this.line.getOtherChild(this).parent === parent){
    						break
    					}else{
    						parent.addChildren(this)
    						parent.updateOtherChildPositionX(this)
    						return
    					}	
    				}
    			}
    		}
    		this.parent.addChildren(this)
	    })
	}
	move(x = 0, y = 0){
		this.x += x
		this.y += y
		this.updatePosition()
	}
	updatePosition(x = this.x, y = this.y){
		this.x = x
		this.y = y
		if(this.rect){
			this.rect.transform.baseVal[0].matrix.e = x
			this.rect.transform.baseVal[0].matrix.f = y
		}
		this.line.updatePosition(this)
	}
}
Child.list = []

class Line{
	constructor(startParent, endParent, fill = "#FF6A6A"){
		this.start = new Child(this, startParent, fill)
		this.end = new Child(this, endParent, fill)
		startParent.addChildren(this.start)
		endParent.addChildren(this.end)
		this.line = null
		Line.list.push(this)
	}
	getOtherChild(child){
		return this.start === child ? this.end : this.start
	}
	createSvg(){
		this.line = createSvg('line', {
	        x1: this.start.x + this.start.width / 2,
	        y1: this.start.y + this.start.height / 2,
	        x2: this.end.x + this.end.width / 2,
	        y2: this.end.y + this.end.height / 2,
	        stroke: "rgb(99,99,99)"
	    })
	}
	updatePosition(child){
		if(!this.line){
			return
		}
		if(child === this.start){
			this.line.x1.baseVal.value = this.start.x + this.start.width / 2
			this.line.y1.baseVal.value = this.start.y + this.start.height / 2
		}else{
			this.line.x2.baseVal.value = this.end.x + this.end.width / 2
			this.line.y2.baseVal.value = this.end.y + this.end.height / 2
		}
	}
}
Line.list = []

function render(){
	function renderSvg(array){
		array.forEach(ele => {
			ele.createSvg()
		})
	}
	renderSvg(Line.list)
	renderSvg(Parent.list)
	renderSvg(Child.list)
}

function createSvg(tag, attr) {    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', tag)
    for(let key in attr) {
        svg.setAttribute(key, attr[key])
    }
    document.querySelector("svg").appendChild(svg)
    return svg
}

Array.prototype.remove = function(ele){
	let boo = false
	for(let i = 0; i < this.length; i++){
		if(this[i] === ele){
			this.splice(i, 1)
			boo = true
			break
		}
	}
	return boo
}