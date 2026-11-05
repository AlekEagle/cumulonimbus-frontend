import { ref } from 'vue';

export default function fetchWithProgress(url: string) {
  const progress = ref(0);

  async function download() {
    const response = await fetch(url);
    // If the response does not have a Content-Length header, we cannot track progress accurately.
    if (!response.headers.get('Content-Length')) {
      throw new Error('Content-Length header is missing');
    }
    const contentLength = parseInt(response.headers.get('Content-Length')!, 10);
    const reader = response.body!.getReader();
    let receivedLength = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      progress.value = (receivedLength / contentLength) * 100;
    }

    return { body: new Blob(chunks), response };
  }

  return { progress, download };
}
