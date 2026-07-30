import sys
from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox
from controller import AuroraController

class AuroraGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Aurora Creative Engine")
        self.root.geometry("500x350")
        
        self.controller = AuroraController()
        
        # UI Elements
        self.label = tk.Label(root, text="Aurora Local-First Engine", font=("Arial", 14, "bold"))
        self.label.pack(pady=20)
        
        self.ingest_btn = tk.Button(root, text="Ingest Asset", width=30, command=self.ingest_file)
        self.ingest_btn.pack(pady=10)
        
        self.process_btn = tk.Button(root, text="Process Asset (Standard)", width=30, command=self.process_file)
        self.process_btn.pack(pady=10)
        
        self.status_label = tk.Label(root, text="Status: Ready", fg="green")
        self.status_label.pack(pady=20)

    def ingest_file(self):
        file_path = filedialog.askopenfilename()
        if file_path:
            result = self.controller.handle_ingest(file_path)
            if result:
                self.status_label.config(text=f"Status: Ingested {Path(file_path).name}")
                messagebox.showinfo("Success", f"Successfully ingested:\n{file_path}")
            else:
                messagebox.showerror("Error", "Ingestion failed.")

    def process_file(self):
        file_path = filedialog.askopenfilename(initialdir="./aurora_data/assets")
        if file_path:
            file_name = Path(file_path).name
            result = self.controller.handle_process(file_name, operation="standard")
            if result:
                self.status_label.config(text=f"Status: Processed {file_name}")
                messagebox.showinfo("Success", f"Successfully processed:\n{file_name}")
            else:
                messagebox.showerror("Error", "Processing failed.")

if __name__ == "__main__":
    root = tk.Tk()
    app = AuroraGUI(root)
    root.mainloop()
