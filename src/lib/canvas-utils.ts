import { ContentComponent } from '../types';

let _dragComponent: ContentComponent | null = null;

export function setDragComponent(component: ContentComponent) {
  _dragComponent = component;
}

export function getDragComponent() {
  return _dragComponent;
}

export function clearDragComponent() {
  _dragComponent = null;
}
