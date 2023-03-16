'use client'

import { format } from 'date-fns'
import type { Database } from '../../../utils/database.types'
type Post = Database['public']['Tables']['posts']['Row']
type PageProps = {
  post: Post
}

// 投稿詳細
const PostDetail = ({ post }: PageProps) => {
  return (
    <div className="max-w-screen-md mx-auto">
      <div className="text-sm text-gray-500 mb-2 text-center">
        {format(new Date(post.created_at), 'yyyy/MM/dd HH:mm')}
      </div>

      <div className="mb-5">
        <div className="text-center font-bold text-2xl mb-5">Summary</div>
        <div className="border rounded p-2 leading-relaxed break-words whitespace-pre-wrap">
          {post.content}
        </div>
      </div>

      <div>
        <div className="text-center font-bold text-2xl mb-5">Transcript</div>
        <div className="border rounded p-2 leading-relaxed break-words whitespace-pre-wrap">
          {post.prompt}
        </div>
      </div>
    </div>
  )
}

export default PostDetail
