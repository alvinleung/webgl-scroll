const obj = {};
for (let i = 0; i < 100000; i++) {
  obj[`key${i}`] = `value${i}`;
}

// for...in
console.time("for...in");
for (const key in obj) {
  // has own property check is slow
  if (obj.hasOwnProperty(key)) {
    const value = obj[key];
  }
}
console.timeEnd("for...in");

// Object.keys and forEach
console.time("Object.keys");
Object.keys(obj).forEach((key) => {
  const value = obj[key];
});
console.timeEnd("Object.keys");

// Object.entries and for...of
console.time("Object.entries");
for (const [key, value] of Object.entries(obj)) {
  // Process key and value
}
console.timeEnd("Object.entries");

// Object.values and forEach
console.time("Object.values");
Object.values(obj).forEach((value) => {
  // Process value
});
console.timeEnd("Object.values");
