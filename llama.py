import transformers
import torch

model_id = "meta-llama/Llama-3.2-3B"

pipeline = transformers.pipeline(
    "text-generation",
    model=model_id,
    device_map="auto",
    torch_dtype=torch.bfloat16
)

print("Yuki is ready. Type 'exit' to stop.")

while True:
    user_input = input("You: ")
    if user_input.lower() == "exit":
        break

    print("Generating response...")
    response = pipeline(user_input, max_length=100, truncation=True)
    print("Yuki:", response[0]["generated_text"])
