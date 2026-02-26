export async function uploadToGoalcast(file: File, code: string) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
  
    const form = new FormData();
    form.append("file", new Blob([buffer]), file.name);
  
    const res = await fetch(`https://goalcast.eu.ngrok.io/${code}/upload`, {
      method: "POST",
      body: form,
    });
  
    if (!res.ok) {
      throw new Error("Upload naar Goalcast mislukt");
    }
  
    return `https://goalcast.eu.ngrok.io/${code}/files/${file.name}`;
  }
  
  export async function deleteFromGoalcast(code: string, fileUrl: string) {
    const filename = fileUrl.split("/").pop();
    const cleanCode = code.replace(/-/g, "");
  
    await fetch(`https://goalcast.eu.ngrok.io/${cleanCode}/delete/${filename}`, {
      method: "DELETE",
    });
  }
  