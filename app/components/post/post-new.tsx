'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '../supabase-provider'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import { FileUploader } from 'react-drag-drop-files'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

// FFmpeg
const ffmpeg = createFFmpeg({
  corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
  log: true,
})
// 最大25MB
const MAX_FILE_SIZE = 25000000
// ファイルタイプ
const fileTypes = ['mp4', 'mp3']

// 新規投稿
const PostNew = () => {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // FFmpeg Load
  useEffect(() => {
    const load = async () => {
      await ffmpeg.load()
    }
    // Loadチェック
    if (!ffmpeg.isLoaded()) {
      load()
    }
  }, [])

  // 送信
  const handleChange = async (file: File) => {
    setLoading(true)

    try {
      // ファイルチェック
      if (!file) {
        return
      }

      // ffmpeg.wasmがアクセス可能なメモリストレージに保存
      ffmpeg.FS('writeFile', file.name, await fetchFile(file))

      await ffmpeg.run(
        '-i', // 入力ファイルを指定
        file.name,
        '-vn', // ビデオストリームを無視し、音声ストリームのみを出力
        '-ar', // オーディオサンプリング周波数
        '16000',
        '-ac', // チャンネル
        '1',
        '-b:a', // ビットレート
        '96k',
        '-f', // 出力ファイルのフォーマット
        'mp3',
        'output.mp3'
      )

      // ffmpeg.wasmがアクセス可能なメモリストレージから取得
      const readData = ffmpeg.FS('readFile', 'output.mp3')
      // Blob生成
      const audioBlob = new Blob([readData.buffer], { type: 'audio/mp3' })

      // サイズチェック Whisperは最大25MB
      if (audioBlob.size > MAX_FILE_SIZE) {
        alert('サイズが大きすぎます')
        setLoading(false)
        return
      }

      // File作成
      const audio_file = new File([audioBlob], 'audio.mp3', {
        type: audioBlob.type,
        lastModified: Date.now(),
      })

      // FormData
      const formData = new FormData()
      formData.append('file', audio_file)

      // Whisper APIコール
      const response = await fetch(`/api/whisper`, {
        method: 'POST',
        body: formData,
      })
      const response_data = await response.json()
      const transcript = response_data.transcript.trim()

      if (!transcript) {
        setLoading(false)
        alert('文字起こしできませんでした')
        return
      }

      // ChatGPT APIに送信
      const body = JSON.stringify({ prompt: transcript })
      const response2 = await fetch('/api/chatgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      })

      const response_data2 = await response2.json()
      const content = response_data2.text.trim()

      if (!content) {
        setLoading(false)
        alert('要約できませんでした')
        return
      }

      // postsテーブル追加
      const { data: insertData, error: insertError } = await supabase
        .from('posts')
        .insert({
          prompt: transcript,
          content: content,
        })
        .select()

      if (insertError) {
        alert(insertError.message)
        setLoading(false)
        return
      }

      // キャッシュクリア
      router.refresh()
      // 詳細画面に遷移
      router.push(`/post/${insertData[0].id}`)
    } catch (error) {
      alert(error)
    }
    setLoading(false)
  }

  return (
    <div className="flex justify-center mb-5">
      <FileUploader
        handleChange={handleChange}
        name="file"
        types={fileTypes}
        classes="w-full"
        disabled={loading}
        children={
          <div
            className={`${
              loading ? 'border-gray-300 bg-gray-100' : 'border-sky-500 cursor-pointer'
            } border-dashed border-2 rounded p-5`}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="my-5">
                  <div className="h-10 w-10 animate-spin rounded-full border border-yellow-500 border-t-transparent" />
                </div>
                <div className="text-gray-500">少々お待ちください</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <CloudArrowUpIcon className="h-16 w-16 text-sky-500" />
                <div>ファイルをアップロードして要約する</div>
                <div className="text-sm text-gray-500">(MP4 / MP3)</div>
              </div>
            )}
          </div>
        }
      />
    </div>
  )
}

export default PostNew
