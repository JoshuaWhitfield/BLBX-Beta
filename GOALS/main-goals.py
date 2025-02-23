'''

make an RPC (remote procedure protocol)

it is a system that allows a user to run a function on a remote machine through a shell and use the 
return value of that function call locally. I'll use it to make a chat room that only saves logs on my end.
I'll move the logs to a bridge that I designate. that bridge will run as my proxy. Meaning, I'll hack with
it's netsessions and metasploit instances for hacking. I'll send the instructions made by a local parser 
and it will listen and operate on the instructions one by one. I will expand it to send out those instructions 
to a botnet that I have to asymmetrically run functions. 

get online and look for libraries for the router, http, and ssh, and repo (1542). audit them so that they
get stronger and save old versions of metasploit on the main tool. have a folder under dependencies called
main libraries. store metasploit and crypto inside.

make a lexer and tokenizer for the parsing of commands and run them inside of an ast. 
use node and parent structure.

recon(10.0.0.0, -p[0, 80, 22], -cgp, -fw)

-fw = firewall
-cgp = change passwd
-p = port(s) flag
[0, 80, 22] = ports in array form. multiple values are inside arrays instead of bare commas.
10.0.0.0 = IP Address

tokenized: 

{
  "type": "Command",
  "name": "recon",
  "args": [
    {
      "type": "IPAddress",
      "value": "10.0.0.0"
    },
    {
      "type": "Flag",
      "name": "-p",
      "values": [
        { "type": "Number", "value": 0 },
        { "type": "Number", "value": 80 },
        { "type": "Number", "value": 22 }
      ]
    },
    {
      "type": "Flag",
      "name": "-cgp"
    },
    {
      "type": "Flag",
      "name": "-fw"
    }
  ]
}

the command function will accept the ast tree itself and use it as the parameters in the command.
make something that loads up commands in an array and then runs them all in successession on the last call.
the last call has no pip after it:

recon(10.0.0.0, -p[0, 80, 22], -cgp, -fw)


make the recon command look for stored computer and file exploits
against the target and avoid shells. if possible, notify 
which shells were avoided.
'''