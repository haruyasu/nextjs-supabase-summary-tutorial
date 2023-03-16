'use client'

import { format } from 'date-fns'
import Link from 'next/link'
import type { Database } from '../../../utils/database.types'
type Post = Database['public']['Tables']['posts']['Row']

// 投稿アイテム
const PostItem = (post: Post) => {
  const MAX_LENGTH = 100
  let prompt = post.prompt.replace(/\r?\n/g, '')

  // 文字数制限
  if (prompt.length > MAX_LENGTH) {
    prompt = prompt.substring(0, MAX_LENGTH) + '...'
  }

  return (
    <Link href={`post/${post.id}`}>
      <div className="p-3">
        <div className="text-sm text-gray-500 mb-2">
          {format(new Date(post.created_at), 'yyyy/MM/dd HH:mm')}
        </div>
        <div>{prompt}</div>
      </div>
    </Link>
  )
}

export default PostItem
