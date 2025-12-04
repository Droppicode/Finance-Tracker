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

export const extractTextFromPDF = async (file, selection = null) => {
    const formData = new FormData();
    formData.append("file", file);

    if (selection) {
        formData.append("x1", selection.x1);
        formData.append("y1", selection.y1);
        formData.append("x2", selection.x2);
        formData.append("y2", selection.y2);
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_API_OCR_URL}/process`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("Resposta do OCR:", data);

        let allLines = []
        for(const page of data.result) {
            const lines = groupWordsIntoLines(page.words);
            console.log("Lines on page ", page.page, ":", lines);
            allLines = allLines.concat(lines);
        }

        console.log("ALL LINES:", allLines)

        let fullText = "";
        for (const line of allLines) {
            for (const word of line) {
                fullText += word.text + " ";
            }
            fullText += "\n";
        }

        return fullText;
    } catch (error) {
        console.error("Erro envio pdf:", error);
        throw error;
    }
};
