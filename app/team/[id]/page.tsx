'use client'
import { IUser } from "@/components/expandableCards/card";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import Link from "next/link";
import CreateEvent from "@/components/eventCreate/EventCreate";

import mongoose from "mongoose";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useEdgeStore } from "@/lib/edgeStoreRouter";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { toast } from "react-toastify";
import "./teams.css"

import WhatsOnTeamMind from "@/components/WhatsOnYourMInd/WhatsOnTeamMind";
import { Suspense } from "react";
import Layout from "@/components/customLayouts/Layout";
import PostCard from "@/components/eventCard/PostCard";
import LoadingAnimation from "@/components/loadingAnimation/loadingAnimation";
import { Label } from "@/components/ui/label";


export interface IEvent {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  leaders?: mongoose.Schema.Types.ObjectId[];
  image: string;
  team: mongoose.Schema.Types.ObjectId;
  date: Date;
  members?: mongoose.Schema.Types.ObjectId[];
  description: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  participated?: mongoose.Schema.Types.ObjectId[];
  requests?: mongoose.Schema.Types.ObjectId[];
  location: string;
  time: string;
  createdAt?: Date;
  updatedAt?: Date;
}



const TeamPage = () => {

  const [members, setMembers] = useState<IUser[]>([])
  const [teamImg, setTeamImg] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>("");
  const [createdBy, setCreatedBy] = useState<IUser | null>();
  const [leaders, setLeaders] = useState<IUser[]>();
  const [teamName, setTeamName] = useState<string>("")

  const [events, setEvents] = useState<IEvent[] | null>([])

  const [requests, setRequests] = useState<IUser[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true);



  const [file, setFile] = useState<File | null>(null);

  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const [progress, setProgress] = useState<number>(0);

  const [preview, setPreview] = useState<string | null>(null)

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  console.log(id, "team id")

  const { user, isLoaded } = useUser();
  const mongoId = user?.publicMetadata.mongoId as string



  useEffect(() => {
    const TeamHandler = async () => {
      setLoading(true);
      await fetch(`/api/team?id=${id}`).then(res => res.json()).then(data => {
        setMembers(data.members);
        setTeamImg(data.image);
        setDescription(data.description);
        setCreatedBy(data.createdBy);
        setLeaders(data.leaders);
        setRequests(data.requests);
        setTeamName(data.name);
        setEvents(data.events)
        setPosts(data.posts);
        setLoading(false);
      })
    }

    TeamHandler();
  }, [])

  const joinHandler1 = async () => {
    const response = await fetch(`/api/join?id=${mongoId}&type=join`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json();
    if (response) {
      toast.success("Request sent successfully")
    } else {
      toast.error("Request failed")
    }
  }


  const joinHandler = (id: string) => {
    try {

      const join = async () => {
        const res = await fetch(`/api/team?type=join&id=${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: mongoId }),

        })
        const data = await res.json();
        if (res) {
          toast.success("Request sent successfully")
        } else {
          toast.error("Request failed")
        }
      }
      join();

    } catch (error) {
      console.error(error);
    }
  }


  const removeAcceptHandler = (newParticipant: IUser) => {



    const updatedRequests = requests?.filter((request) => request._id.toString() !== newParticipant._id.toString())
    setRequests(updatedRequests || []);

    const updateParticipants = async () => {
      const res = await fetch(`/api/team?id=${id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: updatedRequests })
      })

      const data = res.json();
      if (res.ok) {
        toast.success("Participant Removed successfully");
      }
    }
    updateParticipants();
  }


  const isLeader = leaders?.some((leader) => leader._id.toString() === mongoId);
  const isVolunteer = members?.some((member) => member._id.toString() === mongoId);

  const acceptRequestHandler = (newParticipant: IUser) => {

    const updatedMembers = members ? [...members, newParticipant] : [newParticipant];
    setMembers(updatedMembers);

    const updatedRequests = requests?.filter((request) => request._id.toString() !== newParticipant._id.toString())
    setRequests(updatedRequests);

    const updateParticipants = async () => {
      const res = await fetch(`/api/join?tid=${id}&id=${newParticipant._id.toString()}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },

      })

      const data = res.json();
      if (res.ok) {
        toast.success("Participant added successfully");
      }
    }
    updateParticipants();
  }


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const file = files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { edgestore } = useEdgeStore();


  const handleUpload = async () => {

    if (file) {

      const res = await edgestore.mypublicImages.upload({
        file,
        onProgressChange: (progress) => {
          setProgress(progress);
        }
      })



      const response = await fetch(`/api/upload?id=${id}&source=team`, {
        method: "POST",
        body: JSON.stringify({ imgUrl: res.url, thumbUrl: res.thumbnailUrl })
      })

      if (response.ok) {
        setUploadStatus("Image uploaded successfully")
        window.location.reload();
      }
    }

  }




  return (
    <Layout>
      <div className="bg min-h-screen">

        {loading &&
          <div className="pt-44"><LoadingAnimation></LoadingAnimation></div>
        }

        {!loading && <div className="animate-slide-top mt-4 p-5 px-4 gap-1 flex justify-between ctab:flex-col ctab:items-center">
          <div className="ctab:order-2 w-full">
            <Card className="p-3 py-5 glass items-center flex ctab:flex-col border-0 ctab:mx-auto w-full">
              <div className="flex gap-6 ctab:flex-col">
                <div className="h-40 w-40 mx-auto">
                  
                    <div className="relative rounded-full">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="opacity-0 text-2xl font-bold hover:opacity-80 absolute bg-black top-0 left-0 h-full w-full flex items-center justify-center cursor-pointer">
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Event Details</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col gap-8 mt-6">
                            <div className="flex flex-col">
                              <Label>Upload Image</Label>
                              <input type="file" onChange={handleFileChange}className="mt-4"></input>
                              <Button    onClick={() => handleUpload()} variant={"default"} className="bg-green-600 hover:bg-green-700 w-20 right-0 self-end">Save</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Image
                        className="h-40 w-40 rounded-full"
                        width={160}
                        height={160}
                        src={teamImg || "/default-image-path.jpg"}
                        alt={teamName}>
                      </Image>
                    </div> 

                </div>


                <div className="flex flex-col gap-3">
                  <div className="gap-3 items-center">
                    <h1 className="text-5xl ctab:text-4xl ctab:text-center text-cyan-200 font-semibold">{teamName}</h1>
                    <Dialog>
                      <DialogTrigger asChild>
                        <IoMdInformationCircleOutline className="ctab:w-7 flex-wrap ctab:h-7 hover:opacity-80 h-10 w-10 cursor-pointer mt-3 ctab:mx-auto"></IoMdInformationCircleOutline>
                      </DialogTrigger>
                      <DialogContent className="border-2">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">About Team</DialogTitle>
                        </DialogHeader>
                        <p className="text-lg max-h-[600px] overflow-y-scroll scrollbar-thin scrollbar-track-black scrollbar-thumb-black">{description}</p>
                      </DialogContent>
                    </Dialog>

                  </div>


                  <div className="flex flex-col">
                    <div className="capitalize text-2xl text-yellow-600 ctab:text-center">Team Leader {leaders?.map((leader) => (
                      <h3 key={leader._id.toString()} className="ctab:mx-auto bg-red-300 w-fit mb-1 mt-1 text-black  px-2 border-2 border-red-900 rounded-xl text-lg">{leader.name}</h3>
                    ))}</div>
                    <h3 className="text-2xl mt-4 ctab:text-center">Created By: {createdBy?.name}</h3>
                  </div>

                  <div className="flex border-2 justify-start gap-4 flex-wrap">
                    {!isVolunteer &&
                      <Button className="w-fit text-md " onClick={() => joinHandler(id!)}>Request to Join</Button>}
                    {isLeader && <div className="flex gap-4 justify-start">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>Edit</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Team</DialogTitle>
                            <div>
                              {/* give edit team form content here*/}
                            </div>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>Manage Team Members</Button>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Requests</DialogTitle>
                          </DialogHeader>
                          <DialogContent>


                            <div>
                              <div className="w-[100%] height-[100px] max-h-[50vh] overflow-y-scroll ">
                                {requests?.map((participant) => (
                                  <div className="flex flex-row justify-start items-center" key={participant?._id?.toString()}>
                                    <div className="px-2 mx-2">
                                      <img src={participant?.image} alt={participant?.name} className="object-cover w-[60px] h-[60px]" /></div>

                                    <div className="flex flex-col px-2 mx-2">
                                      <div className="">{participant?.name}</div>
                                      <div className="">{participant?.gradYear}</div>
                                    </div>

                                    <button onClick={() => acceptRequestHandler(participant)} className="px-2 mx-2 bg-[#3bc249] py-1 rounded-md">Accept</button>
                                    <button onClick={() => removeAcceptHandler(participant)} className="px-2 mx-2 bg-red-500 py-2 rounded-full">X</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </DialogContent>






                        </DialogContent>
                      </Dialog>
                    </div>
                    }
                  </div>

                </div>
              </div>

            </Card>

            <div className="w-full rounded-xl mt-5">
              <Tabs defaultValue="members">
                <TabsList className="flex items-center justify-center bg-transparent flex-wrap h-auto space-y-1">
                  {isVolunteer && <TabsTrigger value="members" className="mt-1 text-lg">Members</TabsTrigger>}
                  <TabsTrigger value="posts" className="text-lg">Posts</TabsTrigger>
                </TabsList>
                {isVolunteer && <TabsContent value="members">
                  <TeamMembersCard members={members}></TeamMembersCard>
                </TabsContent>}
                <TabsContent value="posts">
                  {isLeader && <div>{id &&
                    <WhatsOnTeamMind title={teamName}
                      id={id}
                    ></WhatsOnTeamMind>}
                  </div>}
                  {posts?.map((userPost) => (
                    <div className="" key={userPost._id?.toString()}>
                      <PostCard post={userPost} />
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>


          </div >

          <Accordion type="single" collapsible className="hidden ctab:flex w-full mb-10">
            <AccordionItem value="item-1" className="w-full">
              <AccordionTrigger className="text-2xl w-full border-2">Upcoming Events</AccordionTrigger>
              <AccordionContent className="w-full">
                <UpcomingEventsCard events={events} mongoId={mongoId}></UpcomingEventsCard>
              </AccordionContent>
            </AccordionItem>
          </Accordion>


          <div className="ctab:hidden">
            <UpcomingEventsCard events={events} mongoId={mongoId}>
            </UpcomingEventsCard>
          </div>



        </div >}


        {isLeader &&
          <div className="flex">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="ml-10 cphone:mx-auto">Create Event</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[600px] max-w-[700px] bg-slate-950 opacity-75">
                <DialogHeader>
                  <DialogTitle className="text-xl">Create Event</DialogTitle>
                </DialogHeader>

                <div className="flex overflow-hidden h-[500px]">
                  <CreateEvent teamId={id} members={members}></CreateEvent>
                </div>

              </DialogContent>
            </Dialog>

          </div>}

      </div >
    </Layout>
  )
}

const UpcomingEventsCard = ({ events, mongoId }: { events: IEvent[] | null, mongoId: string }) => {
  return (
    <Card className="glass w-full">
      <CardHeader>
        <CardTitle className="text-xl text-cyan-200">Upcoming Events</CardTitle>
      </CardHeader>

      <CardContent>

        <div className="flex flex-col gap-2">
          {events?.map((event) => (
            <EventCard key={event._id.toString()} event={event} mongoId={mongoId}></EventCard>
          ))}
        </div>

      </CardContent>
    </Card >

  )
}

const EventCard = ({ event, mongoId }: { event: IEvent, mongoId: string }) => {
  return (
    <div className="bg-transparent w-full hover:bg-slate-700 hover:scale-[1.02] transition-all duration-200 min-w-[300px] cphone:w-[210px] rounded-xl p-3">
      <h1 className="text-purple-300 font-semibold text-2xl">{event.name}</h1>
      <p className="mt-3 text-lg">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
      <p>SNT Building</p>
      <Button className="mt-4">
        <Link href={`/event/${event._id.toString()}?uid=${mongoId}`} className="p-2 rounded-full transition-colors group-hover:rotate-45 transform duration-300">
          View Event
        </Link>
      </Button>
    </div>
  )
}



const TeamMembersCard = ({ members }: { members: IUser[] | null }) => {
  return (
    <Card className="mt-10 bg-transparent border-0">
      <CardContent className="">
        <div className="flex flex-wrap gap-7 justify-center">
          {members?.map((member) => <MemberCard member={member} key={member._id.toString()}></MemberCard>)}
        </div>
      </CardContent>
    </Card>
  )
}

const MemberCard = ({ member }: { member: IUser }) => {
  return (
    <Card className="w-fit hover:[glass] hover:bg-slate-700 border-0 cursor-pointer bg-transparent">
      <CardContent className="mt-7">
        <div className=" w-fit ctab:gap-5">
          <h1 className="text-2xl capitalize ctab:text-xl">{member.name}</h1>
          <p className="text-sm">{member.email}</p>
        </div>
      </CardContent>
    </Card>)
}

const teamPageWithSuspense = () => (
  <Suspense fallback={<div>Loading</div>}>
    <TeamPage></TeamPage>
  </Suspense>
)

export default teamPageWithSuspense;