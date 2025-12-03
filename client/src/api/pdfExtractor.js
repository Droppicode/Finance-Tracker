
export const extractTextFromPDF = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${import.meta.env.VITE_API_OCR_URL}/process`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("Resposta do OCR:", data);

        return fullText;
    } catch (error) {
        console.error("Erro envio pdf:", error);
        throw error;
    }
};
