// @ts-nocheck
import Image from "next/image"
import { Layout } from "@/components/Layout"
import logo from "@/assets/logos/logo-2.svg"
import metamask from '@/assets/icons/metamask.svg'
import Link from "next/link"
import { motion } from "framer-motion"
import { verifyConnectToMetamask } from "@/utils/verifyConnectToMetamask"
import { useEffect, useState } from "react"
import userService from "@/services/userService"
import { useRouter } from 'next/navigation';
import toast, { Toaster } from "react-hot-toast"
import Cookies from "universal-cookie"
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"
import { loginLineVariants, loginSloganVariants, loginButtonVariants } from '@/animations/';


import { useMemo, } from 'react';
import '@tronweb3/tronwallet-adapter-react-ui/style.css';
import type { WalletError } from '@tronweb3/tronwallet-abstract-adapter';
import { WalletDisconnectedError, WalletNotFoundError } from '@tronweb3/tronwallet-abstract-adapter';
import { WalletProvider, useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import {
    WalletActionButton,
    WalletModalProvider,
} from '@tronweb3/tronwallet-adapter-react-ui';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink';
import Swal from 'sweetalert2'


const Login = () => {
    const [isConnected, setIsConnected] = useState(false)
    const [checkWallet, setIsWallet] = useState(true);
    const [address, setAddress] = useState("")
    const [password, setPassword] = useState("")
    const [passwordVisible, setPasswordVisible] = useState(true)

    const cookie = new Cookies()

    const router = useRouter();

    async function verify(_address) {
        try {
            const response = await userService.verify(_address)
            console.log(response)
            if (response.data === "User not found") {
                toast.error("User not found, redirecting to signup")
                setTimeout(() => {
                    router.push(`/signup?address=${_address}`)
                }, 2000)
            } else {
                return
            }
        } catch (err) {
            router.push("/signup")
        }
    }
    async function Auth() {
        try {
            const response = await userService.auth(address, password)
            cookie.set("token", response.data.access_token)
            router.push("/")
        } catch (err) {
            console.log(err)
            toast.error("Invalid credentials")
        }
    }

    function onError(e: WalletError) {
        if (e instanceof WalletNotFoundError) {
            toast.error(e.message);
        } else if (e instanceof WalletDisconnectedError) {
            toast.error(e.message);
        } else toast.error(e.message);
    }
    const adapters = useMemo(function () {
        try {
            const tronLinkAdapter = new TronLinkAdapter();

            if (tronLinkAdapter._readyState === "Found") {
                setIsWallet(()=>true)
                verify(tronLinkAdapter.address)
                return [tronLinkAdapter];
            } else {
                setIsWallet(()=>false)
            }
        } catch (err) {
            err && console.warn(err.message)
        }
    }, []);

    useMemo(() => {
        if (!checkWallet) {
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });
            Toast.fire({
                icon: "error",
                title: "Please Install Tron wallet"
            });
        }
    }, [checkWallet])

    // const _style: React.CSSProperties = {
    //     background: "none",
    //     zIndex: 99999,
    //     // pointerEvents: !checkWallet ? "none" : "all",
    // };

   
    return (
        <Layout title={"Login"} navbar={false}>
            <Toaster />
            <div className="flex flex-1">
                <div className="bg-white w-1/2 flex flex-col flex-1 items-center justify-center h-full">
                    <div className="mb-8 flex flex-col items-center">
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1 } }} className="text-7xl font-semibold text-gray-400 text-center mb-16">Welcome to</motion.p>
                        <motion.div initial={{ opacity: 0, scale: 1.2, y: 10 }} animate={{ y: 0, opacity: 1, scale: 1, transition: { delay: 1.5, duration: 1 } }}>

                            <Image width={550} alt="Metamask" src={logo} />
                        </motion.div>

                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 2 } }} className=" mt-16 text-5xl text-gray-400 font-medium text-center">Share, donate, create</motion.p>
                    </div>

                </div>

                <div className="w-1/2 flex flex-col items-center bg-blue-400 text-white justify-center h-full">
                    <motion.p variants={loginSloganVariants} initial="start" animate='end' className="text-4xl font-medium mb-16">Log into your account</motion.p>

                    <div className="w-full md:w-2/5 flex  flex-col items-center">

                        {
                            (!isConnected) &&
                            <>
                                <WalletProvider onError={onError} autoConnect={false} disableAutoConnectOnLoad={true} adapters={adapters}>
                                {/* <div style={_style}> */}
                                    <WalletModalProvider>
                                        <motion.div variants={loginLineVariants} initial="start" animate='end'>
                                            <WalletActionButton />
                                        </motion.div>
                                        <Profile setIsConnected={setIsConnected} setAddress={setAddress} />
                                    </WalletModalProvider>
                                    {/* </div> */}
                                </WalletProvider>
                            </>


                        }

                        {
                            (isConnected) &&
                            <>
                                <div className="flex w-full items-center my-8">
                                    <div className="h-0.5 w-full border-t-0 bg-blue-400 opacity-50"></div>

                                    <p className="text-blue-400 mx-2">Continue</p>

                                    <div className="h-0.5 w-full border-t-0 bg-blue-400 opacity-50"></div>
                                </div>

                                <div className="w-full">
                                    {/* <div>
                                        <p className="text-2xl text-blue-400">Email</p>
                                        <input className="border-2 border-blue-400 rounded-lg w-full px-4 placeholder:text-blue-400 focus:border-blue-500 py-2" type="text" placeholder="email@email.com" />
                                    </div> */}

                                    <div>
                                        <p className="text-xl text-white">Password</p>
                                        <div className="flex flex-row items-center relative">
                                            {
                                                (passwordVisible) ? (
                                                    <>
                                                        <input onChange={event => setPassword(event.target.value)} className=" text-black rounded-lg w-full px-4 py-2 placeholder:text-blue-400 focus:border-blue-500" type="password" placeholder="********" />
                                                        <button onClick={() => { setPasswordVisible(false) }} className="absolute right-2"><AiFillEye size={24} color="#60A5FA" /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <input onChange={event => setPassword(event.target.value)} className=" text-black rounded-lg w-full px-4 py-2 placeholder:text-blue-400 focus:border-blue-500" type="text" placeholder="********" />
                                                        <button onClick={() => { setPasswordVisible(true) }} className="absolute right-2"><AiFillEyeInvisible size={24} color="#60A5FA" /></button>
                                                    </>
                                                )
                                            }

                                        </div>
                                    </div>

                                    <button onClick={() => { Auth() }} className="bg-white text-gray-500 hover:scale-105 transition-all shadow-lg font-semibold text-xl rounded-lg hover:text-black px-4 py-2 justify-center flex items-center p-2 mt-8 w-full">
                                        Login
                                    </button>

                                    {/* <div className="w-full flex justify-end">
                                        <Link href="/signup" className="text-blue-400 text-sm underline text-end">I don't have an account</Link>
                                    </div> */}
                                </div>
                            </>
                        }

                    </div>
                </div>

            </div>
        </Layout>
    )
}

export default Login


function Profile({ setIsConnected, setAddress }) {
    const { address , select } = useWallet();
    const router = useRouter();

    useEffect(() => {
        select("TronLink")
    }, [])
    useEffect(() => {
        (async () => {
            if (address) {
                tronWeb.setAddress(address);
                try {
                    const response = await userService.verify(address)
                    console.log(response)
                    if (response.data === "User not found") {
                        toast.error("User not found, redirecting to signup")
                        setTimeout(() => {
                            router.push(`/signup?address=${address}`)
                        }, 2000)
                    } else {
                        setAddress(address)
                        setIsConnected(true)
                    }
                } catch (err) {
                    router.push("/signup")
                }
            }
        })()
    }, [address]);
    return (
        <div></div>
    );
}