from langchain_core.messages import HumanMessage


def process_agent_stream(agent, config, user_input)->str:
    signature_result = ""
    for chunk in agent.stream(
            {"messages": [HumanMessage(content=user_input)]}, config
    ):
        if "agent" in chunk:
            signature_result += chunk["agent"]["messages"][0].content + "\n"
        elif "tools" in chunk:
            print(chunk["tools"]["messages"][0].content)
        print("-------------------")

    return signature_result