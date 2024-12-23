'use client'

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { currentPerson, people } from "@/action/user";
import mongoose from "mongoose";
import { ExpandableCardDemo,IUser,IUserArray } from "@/components/expandableCards/card";

const SimPeople = () => {


    const searchParams = useSearchParams();
    const id = searchParams.get('id') as string;
    const [similarPeople, setSimilarPeople] = useState([]);
    const [loggedUser, setLoggedUser] = useState<IUser | null>(null);

    useEffect(() => {
        if (id) {
            (async () => {
                try {
                    const result = await people(id);
                    const a=await currentPerson(id)
                    setSimilarPeople(result);
                    setLoggedUser(a);

                } catch (error) {
                    console.error("Error fetching similar people:", error);
                }
            })();
        }
    }, [id]);

    return (
        <div>

          <div className="">

          </div>
          
          <div className="">
             <h1>#Users sharing similar interests as yours</h1>
             <ExpandableCardDemo users={similarPeople} cUser={loggedUser}/>
            </div>
           
        </div>
    );
}

export default SimPeople;