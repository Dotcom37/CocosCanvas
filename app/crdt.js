// crdt.js
import * as Y from "yjs";

const doc = new Y.Doc();

// Shared canvas objects
const objects = doc.getArray("canvas-objects");

// Add an object
export function addObject(object) {
    objects.push([object]);
}

// Update an object
export function updateObject(index, object) {
    objects.delete(index, 1);
    objects.insert(index, [object]);
}

// Remove an object
export function removeObject(index) {
    objects.delete(index, 1);
}

// Listen for changes
objects.observe((event) => {
    console.log("Canvas changed:", objects.toArray());
}); 