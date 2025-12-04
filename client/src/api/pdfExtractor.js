function groupWordsIntoLines(words, tolerance = 20) {
  const sortedWords = [...words].sort((a, b) => a.box.top - b.box.top);

  const lines = [];
  let currentLine = [];
  
  let lastTop = sortedWords[0].box.top;

  for (const word of sortedWords) {
    const currentTop = word.box.top;

    if (Math.abs(currentTop - lastTop) <= tolerance) {
      currentLine.push(word);
    } else {
      currentLine.sort((a, b) => a.box.left - b.box.left);
      lines.push(currentLine);

      currentLine = [word];
      lastTop = currentTop;
    }
  }

  if (currentLine.length > 0) {
    currentLine.sort((a, b) => a.box.left - b.box.left);
    lines.push(currentLine);
  }

  return lines;
}

export const extractTextFromPDF = async (file, config) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${import.meta.env.VITE_API_OCR_URL}/process`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("Resposta do OCR:", data);

        let transactions = []
        if (data.result && Array.isArray(data.result)) {
          for(const page of data.result) {
            if (page.words && page.words.length > 0) {
              const lines = groupWordsIntoLines(page.words);
              console.log("Lines on page ", page.page, ":", lines);

              for (const line of lines) {
                if(line[0].box.top > config.tableYBbox.y1 && line[0].box.top + line[0].box.height < config.tableYBbox.y2) {
                  let transaction = {}, date = "", description = "", value = "";
                  for (const word of line) {
                    let mid = word.box.left + word.box.width/2;
                    if(mid > config.columns[0].bbox.x1 && mid < config.columns[0].bbox.x2) {
                      date += word.text + " ";
                    }
                    if(mid > config.columns[1].bbox.x1 && mid < config.columns[1].bbox.x2) {
                      description += word.text + " ";
                    }
                    if(mid > config.columns[2].bbox.x1 && mid < config.columns[2].bbox.x2) {
                      value += word.text + " ";
                    }
                  }
                  transaction["date"] = date;
                  transaction["description"] = description;
                  transaction["value"] = value;
                  transactions.push(transaction);
                }
              }
            }
          }
        }

        console.log("transactions:", transactions)

        console.log("config:", config)



        return fullText;
    } catch (error) {
        console.error("Erro envio pdf:", error);
        throw error;
    }
};
