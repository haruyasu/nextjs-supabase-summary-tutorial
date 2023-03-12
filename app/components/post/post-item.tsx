'use client'

import { useEffect } from 'react'
import { format } from 'date-fns'
import type { PostType } from '../../../utils/post.types'

// 投稿アイテム
const PostItem = (post: PostType) => {
  // スクロール
  const scrollToBottom = () => {
    const element = document.documentElement
    const bottom = element.scrollHeight
    window.scroll(0, bottom)
  }

  useEffect(() => {
    // 投稿が更新されたら、スクロールする
    scrollToBottom()
  }, [post])

  return (
    <div className="break-words whitespace-pre-wrap">
      <div className="flex items-end justify-end space-x-2 mb-5">
        <div className="text-sm text-white">{format(new Date(post.created_at), 'HH:mm')}</div>
        <div className="bg-[#8DE055] p-3 rounded-xl drop-shadow-md max-w-lg">{post.prompt}</div>
      </div>

      {post.content && (
        <div className="mb-5">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full object-cover bg-yellow-500 flex justify-center items-center text-white text-xs font-bold">
              A
            </div>
            <div className="text-white">AI</div>
          </div>

          <div className="flex items-end space-x-2">
            <div className="bg-white p-3 rounded-xl drop-shadow-md max-w-lg">
              {post.content.trim()}
            </div>
            <div className="text-sm text-white">{format(new Date(post.updated_at), 'HH:mm')}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostItem
