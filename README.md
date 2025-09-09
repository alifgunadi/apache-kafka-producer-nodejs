# How to running apache-kafka

1. Open terminal and direct to:
   `C:\kafka`

2. Then:

-   zookeper: `.\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties`
-   kafka-server: `.\bin\windows\kafka-server-start.bat .\config\server.properties`

# How to running producer with nodejs

-   `npm run start`

# How to force delete kafka-log folder

Open CMD:

-   `del /f C:\kafka\tmp\kafka-logs`
