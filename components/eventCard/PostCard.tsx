import React, { useEffect, useRef, useState } from 'react';
import { Users, Clock, Heart, Share2, MessageCircle } from 'lucide-react';
import { EventPost } from '@/app/becommunity/page';
import { ObjectId } from 'mongoose';
import { UserPost } from '@/models/UserPost';
import { redirect } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import parse from "html-react-parser";

export type UserPost = {
  _id?: ObjectId; // Optional, generated by MongoDB
  createdBy: ObjectId;
  createdAt?: Date; // Managed by mongoose timestamps
  updatedAt?: Date; // Managed by mongoose timestamps
  caption: string;
  image: string;
  imgThumbnail?: string;
  name: string;
  user: {
    name: string,
    image: string
  }
  date: string;
  likes: [string];
  isEventPostPost: boolean;
  projectProgress: number;
  from?: {
    _id: ObjectId;
    image: string;
  };
};



type TeamPost = {


  title: string;
  from: string;
  team:{
    image: string;
    _id: string;
  }

  caption: string;
  image: string;
  imgThumbnail?: string;


  likes: [string];


}

interface PostCardProps {
  post: UserPost | EventPost | TeamPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { caption, image, likes, imgThumbnail } = post;

  const name = 'name' in post ? post.name : '';
  const title = 'title' in post ? post.title : '';
  const projectProgress = 'projectProgress' in post ? post.projectProgress : 0;

  const isEventPost: boolean = 'isEventPost' in post ? (post as EventPost).isEventPost : false;
  const [liked, setLiked] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(true);
  const textRef = useRef(null);

  const renderContent = (content: string) => {
    const modifiedHtml = content.replace(/<p><\/p>/g, '<p>&nbsp;</p>');
    return parse(modifiedHtml);
  }

  useEffect(() => {
    if (textRef.current) {
      const { scrollHeight, clientHeight } = textRef.current;
      setIsOverflowing(scrollHeight > clientHeight); // If true, show "Read More"
    }
  }, [textRef.current]);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleShare = () => {
    console.log('Shared!');
  };

  const handleComment = () => {
    setShowCommentBox(!showCommentBox);
  };

  const handleCommentSubmit = () => {
    console.log('Comment:', comment);
    // Clear the comment box after submission
    setComment('');
    setShowCommentBox(false);
  };

  const { user } = useUser();
  const mongoId = user?.publicMetadata.mongoId;

  return (
    <div className="animate-slide-top glass max-w-[600px] mx-auto p-6 rounded-lg shadow space-y-4 mb-4">

      {'user' in post ? <div>
        <div className="border-b-2 mx-1 border-gray-600 pb-4 flex flex-row items-start justify-normal gap-5" onClick={() => redirect(`/profile?id=${post.createdBy.toString()}`)}>
          <img src={post.user.image} className='cursor-pointer w-10 h-10 rounded-full' />

          <div>
            <h2 onClick={() => redirect(`/profile?id=${post.createdBy.toString()}`)} className="text-green-300 cursor-pointer font-semibold capitalize">{name ? name : title}</h2>
            {/**  <div className="flex items-center text-gray-500 space-x-1">
            <Clock size={16} />
            <span>{new Date(date).toLocaleString()}</span>
          </div>  */}
          </div>
        </div>

        {caption !== undefined ? <div ref={textRef} className={`${isOverflowing ? "line-clamp-3" : ""} relative px-1 py-5 overflow-hidden`}>
          {renderContent(caption)}
        </div> : null}
        {isOverflowing && <div onClick={() => setIsOverflowing(false)} className='text-blue text-center text-blue-500 cursor-pointer hover:text-blue-400 mt-2 mb-2'>Read More</div>}



        {image && (
          <div className="relative w-full flex justify-center">
            <div
              className="w-full h-70 overflow-hidden rounded-lg"
              style={{ backgroundImage: `url(${imgThumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <img
                src={image}
                alt="Post Image"
                className="w-full h-full object-cover"
                loading="lazy"
                onLoad={(e) => (e.target as HTMLImageElement).style.opacity = '1'}

                style={{ opacity: 0, transition: 'opacity 0.5s ease-in-out' }} // Add transition for smooth loading
              />
            </div>


          </div>


        )}
      </div>
        :


        'time' in post ? <div>
          <div className="border-b-2 mx-1 border-gray-600 pb-4 flex flex-row items-start justify-normal gap-5" onClick={() => redirect(`/event/${post?.from}?uid=${mongoId}`)}>
            <img src={post.eventImg?.image} className='cursor-pointer w-10 h-10 rounded-full' />

            <div>
              <h2 onClick={() => redirect(`/event/${post?.from}?uid=${mongoId}`)} className="text-purple-300 cursor-pointer font-semibold">{post.title}</h2>
              {/**  <div className="flex items-center text-gray-500 space-x-1">
            <Clock size={16} />
            <span>{new Date(date).toLocaleString()}</span>
          </div>  */}
            </div>
          </div>

          {caption !== undefined ? <div ref={textRef} className={`${isOverflowing ? "line-clamp-3" : ""} relative px-1 py-5 overflow-hidden`}>
            {renderContent(caption)}
          </div> : null}
          {isOverflowing && <div onClick={() => setIsOverflowing(false)} className='text-blue text-center text-blue-500 cursor-pointer hover:text-blue-400 mt-2 mb-2'>Read More</div>}


          {image && (
            <div className="relative w-full flex justify-center">
              <div
                className="w-full h-70 overflow-hidden rounded-lg"
                style={{ backgroundImage: `url(${imgThumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <img
                  src={image}
                  alt="Post Image"
                  className="w-full h-full object-cover"
                  loading="lazy"

                  // style={{ display: 'none' }} // 

                  onLoad={(e) => (e.target as HTMLImageElement).style.opacity = '1'}

                  style={{ opacity: 0, transition: 'opacity 0.5s ease-in-out' }} // Add transition for smooth loading
                />
              </div>


            </div>


          )}
        </div> :

          <div>
            <div className="border-b-2 mx-1 border-gray-600 pb-4 flex flex-row items-start justify-normal gap-5" onClick={() => redirect(`/team/${post?.from?.toString()}?id=${post?.from?.toString()}`)}>
              <img src={post?.team?.image} className='cursor-pointer w-10 h-10 rounded-full' />

              <div>
                <h2 onClick={() => redirect(`/team/${post?.from?.toString()}?id=${post?.from?.toString()}`)} className="text-yellow-300 cursor-pointer font-semibold">{'title' in post ? post.title : ''}</h2>
                {/**  <div className="flex items-center text-gray-500 space-x-1">
    <Clock size={16} />
    <span>{new Date(date).toLocaleString()}</span>
  </div>  */}
              </div>
            </div>

            {caption !== undefined ? <div ref={textRef} className={`${isOverflowing ? "line-clamp-3" : ""} relative px-1 py-5 overflow-hidden`}>
              {renderContent(caption)}
            </div> : null}
            {isOverflowing && <div onClick={() => setIsOverflowing(false)} className='text-blue text-center text-blue-500 cursor-pointer hover:text-blue-400 mt-2 mb-2'>Read More</div>}


            {image && (
              <div className="relative w-full flex justify-center">
                <div
                  className="w-full h-70 overflow-hidden rounded-lg"
                  style={{ backgroundImage: `url(${imgThumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <img
                    src={image}
                    alt="Post Image"
                    className="w-full h-full object-cover"
                    loading="lazy"

                    // style={{ display: 'none' }} // 

                    onLoad={(e) => (e.target as HTMLImageElement).style.opacity = '1'}

                    style={{ opacity: 0, transition: 'opacity 0.5s ease-in-out' }} // Add transition for smooth loading
                  />
                </div>


              </div>


            )}
          </div>

      }

    </div>
  );
};

export default PostCard;