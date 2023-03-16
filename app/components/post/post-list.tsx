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
    .order('created_at', { ascending: false })

  // 投稿が見つからない場合
  if (!postsData) return notFound()

  return (
    <div className="border rounded">
      {postsData.map((post, index) => {
        return (
          <div className={postsData.length - 1 === index ? '' : 'border-b'} key={post.id}>
            <PostItem {...post} />
          </div>
        )
      })}
    </div>
  )
}

export default PostList
