'use client'

import { KeyboardEvent, useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '../supabase-provider'
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid'
import { useStopwatch } from 'react-timer-hook'

const MicRecorder = require('mic-recorder-to-mp3')

// 新規投稿
const PostNew = () => {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [transcript, setTranscript] = useState('')
  const recorder = useRef<typeof MicRecorder>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [recording, setRecording] = useState(false)

  const { seconds, minutes, start, pause, reset } = useStopwatch({
    autoStart: false,
  })

  useEffect(() => {
    // インスタンス作成
    recorder.current = new MicRecorder({ bitRate: 128 })
  }, [])

  // 音声録音開始
  const startRecording = async () => {
    // ストップウォッチ開始
    reset()
    // 録音開始
    await recorder.current
      .start()
      .then(() => {
        setRecording(true)
      })
      .catch((error: string) => {
        console.error(error)
      })
  }

  // 音声録音停止
  const stopRecording = async () => {
    // ストップウォッチ停止
    pause()
    // 録音停止
    await recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]: any) => {
        // 音声ファイル生成
        const file = new File(buffer, 'audio.mp3', {
          type: blob.type,
          lastModified: Date.now(),
        })
        // 録音停止
        setLoading(true)
        setAudioFile(file)
      })
      .catch((error: string) => {
        console.log(error)
        setLoading(false)
      })

    // 録音停止
    setRecording(false)
  }

  useEffect(() => {
    const fn = async () => {
      try {
        if (audioFile) {
          // 送信データ
          const formData = new FormData()
          formData.append('file', audioFile)

          // Whisper API
          const response = await fetch(`/api/whisper`, {
            method: 'POST',
            body: formData,
          })
          const response_data = await response.json()

          // 音声認識チェック
          if (response_data.transcript) {
            setTranscript(response_data.transcript)
          }
        }
      } catch (error) {
        alert(error)
        setLoading(false)
      }
      setAudioFile(null)
    }

    fn()
  }, [audioFile])

  useEffect(() => {
    if (transcript) {
      // 送信
      onSubmit()
    } else {
      setLoading(false)
    }
  }, [transcript])

  // 送信
  const onSubmit = async () => {
    setLoading(true)

    try {
      if (prompt || transcript) {
        const message = prompt || transcript

        // Postテーブル追加
        const { data: insertData, error: insertError } = await supabase
          .from('posts')
          .insert({
            prompt: message,
          })
          .select()

        if (insertError) {
          alert(insertError.message)
          return
        }

        // キャッシュクリア
        router.refresh()

        // 送信データ
        const body = JSON.stringify({ prompt: message })
        // ChatGPT API
        const response = await fetch('/api/chatgpt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body,
        })

        const response_data = await response.json()

        if (response_data.text) {
          // Postテーブル更新
          const { error: updateError } = await supabase
            .from('posts')
            .update({
              content: response_data.text,
            })
            .eq('id', insertData[0].id)

          if (updateError) {
            alert(updateError.message)
            setLoading(false)
            return
          }

          // キャッシュクリア
          router.refresh()
        }
      }
    } catch (error) {
      alert(error)
    }

    // フォームクリア
    setPrompt('')
    setTranscript('')
    setLoading(false)
  }

  // 入力フォームでEnterが押されたら送信、Shift+Enterは改行
  const enterPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == 'Enter' && e.shiftKey == false) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="fixed bottom-0 left-2 right-2 h-40 flex flex-col justify-end items-center bg-[#7494C0] pb-5">
      <div className="flex items-center justify-center space-x-5 w-[752px]">
        <textarea
          className={`w-full ${
            loading ? 'bg-gray-300' : 'bg-gray-50'
          } rounded-xl py-3 px-3 outline-none focus:bg-white`}
          id="prompt"
          name="prompt"
          placeholder="How are you?"
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => enterPress(e)}
          value={prompt}
          rows={2}
          disabled={loading}
          required
        />

        <div className="w-[60px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <StopIcon className="h-7 w-7 text-white" />
              </div>
              <div className="text-white font-bold">
                <span>{('0' + minutes).slice(-2)}</span>:<span>{('0' + seconds).slice(-2)}</span>
              </div>
            </div>
          ) : recording ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <StopIcon className="h-7 w-7 cursor-pointer text-white" onClick={stopRecording} />
              </div>
              <div className="text-white font-bold">
                <span>{('0' + minutes).slice(-2)}</span>:<span>{('0' + seconds).slice(-2)}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <MicrophoneIcon
                  className="h-7 w-7 cursor-pointer text-gray-700"
                  onClick={startRecording}
                />
              </div>
              <div className="text-white font-bold">00:00</div>
            </div>
          )}
        </div>
      </div>

      <div className="text-white text-sm mt-2">Shift+Enter: 改行, Enter: 送信</div>
    </div>
  )
}

export default PostNew
