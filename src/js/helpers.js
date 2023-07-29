export function dom(element, callback) {
  const el = document.createElement(element);
  callback(el)
  return el;
}