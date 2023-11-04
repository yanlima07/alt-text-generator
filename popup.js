var imgSRC = "";
var paragraphData = "";
var altData = "";

var layout = false;
var config = false;
var run = true;

var checkALT = document.querySelector("input[name=checkALT]");
var altCheck = false;

var checkParagraph = document.querySelector("input[name=checkParagraph]");
var paragraphCheck = false;

var checkGPT35 = document.querySelector("input[name=checkGPT35]");
var GPT35Check = false;

var checkGPT4 = document.querySelector("input[name=checkGPT4]");
var GPT4Check = false;

// Trigger the content script to capture images when the popup is opened
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { action: "captureImagesWithAlt" });
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.images) {
    displayImage(message.images);
    handleParagraphData(message.paragraphs);
  }
});

function displayImage(imageData) {
  const imageContainer = document.getElementById("imageContainer");
  const imageContainerConfig = document.getElementById("imageContainerConfig");

  if (imageData && imageData.length > 0) {
    const { src, alt } = imageData[0];

    imgSRC = src;
    altData = alt;

    // Create a container div for each image and its alt text
    const imageInfoContainer = document.createElement("div");
    const imageInfoContainerConfig = document.createElement("div");
    imageInfoContainer.className = "image-info";
    imageInfoContainerConfig.className = "image-info";

    // Create an image element
    const imgElement = document.createElement("img");
    imgElement.src = src;
    imgElement.alt = alt;

    const imgElementConfig = document.createElement("img");
    imgElementConfig.src = src;
    imgElementConfig.alt = alt;

    // Append the image and alt text to the container div
    imageInfoContainer.appendChild(imgElement);
    imageInfoContainerConfig.appendChild(imgElementConfig);

    // Append the container div to the image container
    imageContainer.appendChild(imageInfoContainer);
    imageContainerConfig.appendChild(imageInfoContainerConfig);
    // });
  } else {
    // Handle the case where no images were found
    const noImagesElement = document.createElement("p");
    noImagesElement.textContent = "No images found on this page.";
    imageContainer.appendChild(noImagesElement);
  }
}

function handleParagraphData(paragraphDataReceived) {
  if (paragraphDataReceived && paragraphDataReceived.length > 0) {
    const { pText } = paragraphDataReceived[0];
    paragraphData = pText;
  }

  displayAltParagraphConfig(altData, paragraphData);

  if (run) {
    runCode();
  }
}

function runCode() {
  displayTextConsole(
    "------------------------------------------------------------------------------------------------------------------------"
  );
  displayTextConsole("1. Starting the code");

  // Verify if img was detected to run the code
  const imgElement = document.querySelector(".image-info img");
  const imgSRC = imgElement ? imgElement.src : "";

  if (imgSRC) {
    sendImageToGoogleVision(imgSRC);
  } else {
    displayText("No image found.");
    displayTextConsole("No image found.");
  }
}

function displayText(textData) {
  displayTextConsole("7. Displaying OpenAI GPT's response");
  const textContainer = document.getElementById("textContainer");

  // Create a container div for the generated alt-text
  const textDiv = document.createElement("div");
  textDiv.className = "text-info";

  // Create a paragraph for the alt text
  const textDivP = document.createElement("p");
  textDivP.textContent = textData;

  // Append the image and alt text to the container div
  textDiv.appendChild(textDivP);

  // Append the container div to the image container
  textContainer.appendChild(textDiv);
}

function displayTextConsole(textData) {
  const consoleContainer = document.getElementById("consoleContainer");

  // Create a container div for the generated alt-text
  const textDiv = document.createElement("div");
  textDiv.className = "console-info";

  // Create a paragraph for the alt text
  const textDivP = document.createElement("p");
  textDivP.textContent = textData;

  // Append the image and alt text to the container div
  textDiv.appendChild(textDivP);

  // Append the container div to the image container
  consoleContainer.appendChild(textDiv);
}

function sendImageToGoogleVision(imageUrl) {
  displayTextConsole("2. Sending data to Google Vision API");
  displayTextConsole(imageUrl);
  const apiKey = "AIzaSyCe4NY5-ALr75PekPeq4fsd3bvzYuKLv9k";
  const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const request = {
    requests: [
      {
        image: {
          source: {
            imageUri: imageUrl,
          },
        },
        features: [
          {
            type: "LABEL_DETECTION",
            maxResults: 20,
          },
        ],
      },
    ],
  };

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })
    .then((response) => response.json())
    .then((data) => {
      const responses = data.responses;
      const labelAnnotations = responses[0].labelAnnotations;

      displayTextConsole("3. Google Vision API's response received");
      displayTextConsole(labelAnnotations);

      decodeGoogleVisionResponse(labelAnnotations);
    })
    .catch((error) => {
      displayTextConsole("3. Error Google Vision API");
      displayTextConsole(error);
      displayTextConsole(
        "------------------------------------------------------------------------------------------------------------------------"
      );
    });
}

function decodeGoogleVisionResponse(GoogleVisionResponseData) {
  if (imgSRC) {
    try {
      const descriptions = GoogleVisionResponseData.map(
        (label) => label.description
      );
      const descriptionString = descriptions.join(", ");

      displayTextConsole("4. Decoding Google Vision API's response");
      displayTextConsole(descriptionString);

      gptVariablesCheck(descriptionString);
    } catch (error) {
      displayTextConsole("4. Error decoding Google Vision API's response");
      displayTextConsole(error);
      displayTextConsole(
        "------------------------------------------------------------------------------------------------------------------------"
      );
    }
  } else {
  }
}

function gptVariablesCheck(descriptionStringOnCheck) {
  var promptCheck = "";

  if (config) {
    displayTextConsole("Sending ALT TEXT: " + altCheck);
    displayTextConsole("Sending PARAGRAPH: " + paragraphCheck);
    displayTextConsole("Sending GPT3.5: " + GPT35Check);
    displayTextConsole("Sending GPT 4: " + GPT4Check);
    switch (true) {
      case altData == "" && paragraphData == "":
        promptCheck = `Create an ALT TEXT based on the following keywords listed in order of importance: "${descriptionStringOnCheck}".`;
        break;
      case altData == "" && paragraphData != "":
        if (paragraphCheck) {
          promptCheck = `Create an ALT TEXT based on all the following points:
          1. The following keywords listed in order of importance: "${descriptionStringOnCheck}";
          2. The following paragraph: "${paragraphData}";
          3. You can avoid the keywords from point 1 that are out of the context given by point 2.`;
          break;
        } else {
          promptCheck = `Create an ALT TEXT based on the following keywords listed in order of importance: "${descriptionStringOnCheck}".`;
          break;
        }
      case altData != "":
        if (paragraphData == "") {
          if (altCheck) {
            promptCheck = `Create an ALT TEXT based on all the following points:
            1. The following keywords listed in order of importance: "${descriptionStringOnCheck}";
            2. The following ALT TEXT: "${altData}";
            3. You can avoid the keywords from point 1 that are out of the context given by point 2.`;
            break;
          } else {
            promptCheck = `Create an ALT TEXT based on the following keywords listed in order of importance: "${descriptionStringOnCheck}".`;
            break;
          }
        } else {
          if (altCheck) {
            if (paragraphCheck) {
              promptCheck = `Create an ALT TEXT based on all the following points:
              1. The following keywords listed in order of importance: "${descriptionStringOnCheck}";
              2. The following ALT TEXT: "${altData}";
              3. The following paragraph: "${paragraphData}";
              4. You can avoid the keywords from point 1 that are out of the context given by points 2 and 3.`;
              break;
            } else {
              promptCheck = `Create an ALT TEXT based on all the following points:
              1. The following keywords listed in order of importance: "${descriptionStringOnCheck}";
              2. The following ALT TEXT: "${altData}";
              3. You can avoid the keywords from point 1 that are out of the context given by point 2.`;
              break;
            }
          } else {
            if (paragraphCheck) {
              promptCheck = `Create an ALT TEXT based on all the following points:
              1. The following keywords listed in order of importance: "${descriptionStringOnCheck}";
              2. The following paragraph: "${paragraphData}";
              3. You can avoid the keywords from point 1 that are out of the context given by point 2.`;
              break;
            } else {
              promptCheck = `Create an ALT TEXT based on the following keywords listed in order of importance: "${descriptionStringOnCheck}".`;
              break;
            }
          }
        }
      default:
        displayTextConsole("No option matched the choices.");
    }

    gptVersionCheck(promptCheck);
  } else {
    switch (true) {
      case altData == "" && paragraphData == "":
        promptCheck = `Create an ALT TEXT based on the following keywords listed in order of importance: "${descriptionStringOnCheck}".`;
        break;
      case altData == "":
        promptCheck = `Create an ALT TEXT based on all the following points:
        1. The following keywords listed in order of importance: "${descriptionStringOnCheck}";
        2. The following paragraph: "${paragraphData}";
        3. You can avoid the keywords from point 1 that are out of the context given by point 2.`;
        break;
      case paragraphData == "":
        promptCheck = `Create an ALT TEXT based on all the following points:
        1. The following keywords listed in order of importance: "${descriptionStringOnCheck}";
        2. The following ALT TEXT: "${altData}";
        3. You can avoid the keywords from point 1 that are out of the context given by point 2.`;
        break;
      default:
        promptCheck = `Create an ALT TEXT based on all the following points:
        1. The following keywords listed in order of importance: "${descriptionStringOnCheck}";
        2. The following ALT TEXT: "${altData}";
        3. The following paragraph: "${paragraphData}";
        4. You can avoid the keywords from point 1 that are out of the context given by points 2 and 3.`;
    }
    sendTextToOpenAIGPT4(promptCheck);
  }
}

function gptVersionCheck(promptCheckVersion) {
  switch (true) {
    case GPT4Check && GPT35Check:
      sendTextToOpenAIGPT4(promptCheckVersion);
      sendTextToOpenAIGPT35(promptCheckVersion);
      break;
    case GPT35Check:
      sendTextToOpenAIGPT35(promptCheckVersion);
      break;

    case GPT4Check:
      sendTextToOpenAIGPT4(promptCheckVersion);
      break;
    default:
      displayTextConsole("Please, select a GPT version.");
      displayTextConsole(
        "------------------------------------------------------------------------------------------------------------------------"
      );
  }
}

function sendTextToOpenAIGPT4(promptGTP4) {
  displayTextConsole("5. Sending data to OpenAI GTP API");
  const apiKey = "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"; // Replace with your OpenAI API key
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  var prompt = promptGTP4;

  displayTextConsole(prompt);

  const requestData = {
    model: "gpt-4", // Specify the ChatGPT model
    messages: [
      {
        role: "system",
        content:
          "You are a helpful and concise assistant that generates ALT TEXT for images.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (
        data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        const altTextGenerated = data.choices[0].message.content;

        displayTextConsole("6. OpenAI GTP's 4 response received");

        displayText(altTextGenerated);
        displayTextConsole(altTextGenerated);
        tts(altTextGenerated);
      }
    })
    .catch((error) => {
      displayTextConsole("6. Error receiving OpenAI GTP's 4 response");
      displayTextConsole(error);
      displayTextConsole(
        "------------------------------------------------------------------------------------------------------------------------"
      );
    });
}

function sendTextToOpenAIGPT35(promptGTP35) {
  displayTextConsole("5. Sending data to OpenAI GTP API");
  const apiKey = "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"; // Replace with your OpenAI API key
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  var prompt = promptGTP35;

  displayTextConsole(prompt);

  const requestData = {
    model: "gpt-3.5-turbo", // Specify the ChatGPT model
    messages: [
      {
        role: "system",
        content:
          "You are a helpful and concise assistant that generates ALT TEXT for images.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (
        data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        const altTextGenerated = data.choices[0].message.content;

        displayTextConsole("6. OpenAI GTP's 3.5 response received");

        displayText(altTextGenerated);
        displayTextConsole(altTextGenerated);
        tts(altTextGenerated);
      }
    })
    .catch((error) => {
      displayTextConsole("6. Error receiving OpenAI GTP's 3.5 response");
      displayTextConsole(error);
      displayTextConsole(
        "------------------------------------------------------------------------------------------------------------------------"
      );
    });
}

function tts(ttsData) {
  displayTextConsole("8. Running TTS");
  // Check for browser support
  if ("speechSynthesis" in window) {
    // Initialize the speech synthesis
    const synth = window.speechSynthesis;

    const utterance = new SpeechSynthesisUtterance(ttsData);

    // Set the language to English (United States)
    utterance.lang = "en-GB"; // or "en-GB" for British English

    // Speak the text
    synth.speak(utterance);
  } else {
    // Browser doesn't support speech synthesis
    displayTextConsole("Speech synthesis not supported in this browser.");
  }
}

// Get the button element by its ID
var button = document.getElementById("configButton");

// Add a click event listener to the button
button.addEventListener("click", changeLayout);

function changeLayout() {
  const initialScreen = document.getElementById("initialScreen");
  const configScreen = document.getElementById("configScreen");

  if (layout) {
    initialScreen.classList.remove("disabled");
    configScreen.classList.remove("enabled");
    config = false;
  } else {
    initialScreen.classList.add("disabled");
    configScreen.classList.add("enabled");
    config = true;
  }

  layout = !layout;
}

function displayAltParagraphConfig(altTextConfig, paragraphConfig) {
  const altContainerConfig = document.getElementById("altContainerConfig");
  const paragraphContainerConfig = document.getElementById(
    "paragraphContainerConfig"
  );

  // Create a paragraph for the alt text
  const altTextP = document.createElement("p");
  altTextP.textContent = "ALT TEXT: " + altTextConfig;

  const paragraphP = document.createElement("p");
  paragraphP.textContent = "PARAGRAPH: " + paragraphConfig;

  // Append the container div to the image container
  altContainerConfig.appendChild(altTextP);
  paragraphContainerConfig.appendChild(paragraphP);
}

// Get the button element by its ID
var buttonCosole = document.getElementById("sendButton");

// Add a click event listener to the button
buttonCosole.addEventListener("click", sendConsole);

function sendConsole() {
  run = true;
  runCode();
}

checkALT.addEventListener("change", function () {
  if (this.checked) {
    altCheck = true;
    displayTextConsole("ALT CHECK " + altCheck);
  } else {
    altCheck = false;
    displayTextConsole("ALT CHECK " + altCheck);
  }
});

checkParagraph.addEventListener("change", function () {
  if (this.checked) {
    paragraphCheck = true;
    displayTextConsole("PARAGRAPH " + paragraphCheck);
  } else {
    paragraphCheck = false;
    displayTextConsole("PARAGRAPH " + paragraphCheck);
  }
});

checkGPT35.addEventListener("change", function () {
  if (this.checked) {
    GPT35Check = true;
    displayTextConsole("GTP3.5 " + GPT35Check);
  } else {
    GPT35Check = false;
    displayTextConsole("GPT3.5 " + GPT35Check);
  }
});

checkGPT4.addEventListener("change", function () {
  if (this.checked) {
    GPT4Check = true;
    displayTextConsole("GTP4 " + GPT4Check);
  } else {
    GPT4Check = false;
    displayTextConsole("GPT4 " + GPT4Check);
  }
});
