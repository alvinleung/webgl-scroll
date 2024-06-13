export default function createWorker(fn: Function) {
  // eslint-disable-next-line local-rules/enforce-call-cleanup
  var blob = new Blob(["self.onmessage = ", fn.toString()], {
    type: "text/javascript",
  });
  var url = URL.createObjectURL(blob);

  // eslint-disable-next-line local-rules/enforce-call-cleanup
  return new Worker(url);
}
