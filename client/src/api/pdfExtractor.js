function groupWordsIntoLines(words) {
  if (!words || words.length === 0) {
    return [];
  }

  // Sort words by their vertical position (top coordinate)
  const sortedWords = [...words].sort((a, b) => a.box.top - b.box.top);

  const lines = [];
  let currentLine = [sortedWords[0]];

  for (let i = 1; i < sortedWords.length; i++) {
    const prevWord = sortedWords[i - 1];
    const currentWord = sortedWords[i];

    // Using average height of the two words for the threshold seems more robust
    const avgHeight = (prevWord.box.height + currentWord.box.height) / 2;
    const verticalDistance = currentWord.box.top - prevWord.box.top;
    const threshold = 1.5 * avgHeight;

    if (verticalDistance <= threshold) {
      // The word is part of the same line
      currentLine.push(currentWord);
    } else {
      // A new line starts
      // Sort the completed line by horizontal position
      if (currentLine.length > 0) {
        //currentLine.sort((a, b) => a.box.left - b.box.left);
        lines.push(currentLine);
      }
      currentLine = [currentWord];
    }
  }

  // Add the last line
  if (currentLine.length > 0) {
    //currentLine.sort((a, b) => a.box.left - b.box.left);
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

        const transactions = [];
        if (!data.result || !Array.isArray(data.result) || !config) {
            return transactions;
        }

        const enabledColumns = config.columns.filter(c => c.enabled);

        for (const page of data.result) {
            if (!page.words || page.words.length === 0) continue;

            const lines = groupWordsIntoLines(page.words);
            console.log(`Lines on page ${page.page}:`, lines);

            let contentStarted = !config.hasHeader;

            for (const line of lines) {
                if (!line.length || line[0].box.top < config.tableYBbox.y1 || (line[0].box.top + line[0].box.height) > config.tableYBbox.y2) {
                    continue;
                }

                if (config.hasHeader && !contentStarted) {
                    contentStarted = true;
                    continue; 
                }

                const lineData = {};
                enabledColumns.forEach(c => { lineData[c.id] = '' });

                for (const word of line) {
                    const mid = word.box.left + word.box.width / 2;
                    
                    for (const col of enabledColumns) {
                        if (col.id === 'value' && config.valueFormat === 'debit_credit_columns') {
                            if (col.bbox_debit && mid > col.bbox_debit.x1 && mid < col.bbox_debit.x2) {
                                lineData.value += `-${word.text.trim()} `;
                            }
                            if (col.bbox_credit && mid > col.bbox_credit.x1 && mid < col.bbox_credit.x2) {
                                lineData.value += `${word.text.trim()} `;
                            }
                        } else if (col.bbox && mid > col.bbox.x1 && mid < col.bbox.x2) {
                            lineData[col.id] += `${word.text.trim()} `;
                        }
                    }
                }
                
                // Trim final spaces
                Object.keys(lineData).forEach(key => lineData[key] = lineData[key].trim());

                const hasContent = Object.values(lineData).some(val => val.length > 0);

                if (hasContent) {
                    const description = lineData.description || '';
                    const valueStr = lineData.value || '0';

                    // Parse Brazilian currency format, removing currency symbols and adjusting decimal separators.
                    const cleanedValueStr = valueStr.replace(/[^\d,-]/g, '').replace(',', '.');
                    const numericValue = parseFloat(cleanedValueStr);

                    // Ignore transactions with no description or zero value
                    if (description.length > 0 && !isNaN(numericValue) && numericValue !== 0) {
                        lineData.value = numericValue;
                        transactions.push(lineData);
                    }
                }
            }
        }

        console.log("transactions:", transactions);
        console.log("config:", config);

        return transactions;
    } catch (error) {
        console.error("Erro envio pdf:", error);
        throw error;
    }
};
