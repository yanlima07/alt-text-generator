// content.js

// Listen for a message from the popup script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "captureImagesWithAlt") {
    const images = Array.from(document.getElementsByTagName("img"));
    const imageInfo = images.map((img) => ({
      src: img.src,
      alt: img.alt,
    }));

    const paragraphs = Array.from(document.getElementsByTagName("p"));

    const paragraph = paragraphs.map((p) => ({
      pText: p.innerText,
    }));

    // Send the image data (including src and alt) back to the popup script
    chrome.runtime.sendMessage({ images: imageInfo, paragraphs: paragraph });
  }
});
