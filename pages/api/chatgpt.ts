import { Configuration, OpenAIApi } from 'openai'

import type { NextApiRequest, NextApiResponse } from 'next'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { prompt } = req.body

    // ChatGPT
    const content = `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever.\nHuman: ${prompt}\nAI:`
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: content }],
    })

    // レスポンスを返す
    const text = response.data.choices[0].message?.content

    res.status(200).json({ text })
  } catch (error) {
    console.error(error)
    res.status(500).send('Something went wrong')
  }
}
