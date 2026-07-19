from processor import process_request

def main():
    domain = input("Enter domain (personal/business/crossover): ").strip().lower()
    user_input = input("Enter your prompt: ")
    
    result = process_request(domain, user_input)
    print("\n--- AURORA OUTPUT ---")
    print(result)

if __name__ == "__main__":
    main()
