import { chatParser } from './ChatParser.js'

export function ChatGPTSubmit() {
    console.log("Calling ChatGPT")

    const chatLog = document.getElementById('chat-log')
    const message = document.getElementById('message')

    const AIChatSubmitBtn = document.getElementById("AIChatSubmitBtn")
    AIChatSubmitBtn?.addEventListener("click", (e) => {
        console.log("in this shit")
        e.preventDefault()
        const messageText = message.value
        message.value = ''
        fetch('http://localhost:3000/ChatAssist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: messageText
            })
        })
            .then(res => res.json())
            .then(data => {
                chatParser(data.completion.content)
            })

    })
}