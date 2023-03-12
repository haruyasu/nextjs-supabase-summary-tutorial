import { notFound } from 'next/navigation'
import { createClient } from '../../../utils/supabase-server'
import PostItem from './post-item'

// 投稿リスト
const PostList = async () => {
  const supabase = createClient()

  // 投稿リスト取得
  const { data: postsData } = await supabase
    .from('posts')
    .select()
    .order('created_at', { ascending: true })

  // 投稿が見つからない場合
  if (!postsData) return notFound()

  return (
    <div className="mb-40">
      {postsData.map((post) => {
        return <PostItem key={post.id} {...post} />
      })}
    </div>
  )
}

export default PostList
