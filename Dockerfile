############################################################
# Builds a Meteor 0.9.x+ application Docker image
#
# See: http://docs.docker.io/
#
#  Important:  Best to run from a clean directory that hasn't had meteor run in it.
#  Important:  packages/<pkg>/.npm and .build* should not exist
#
# Example usage:
#  cd appdir                                                 #in app dir
#  docker build -t dixonscz/dixeet .                         #build step
#  docker run -d  \
#       -e ROOT_URL=http://<URL> \
#       -e MONGO_URL=mongodb://<MONOG_URL> \
#       -p 8080:80 \
#       dixonscz/dixeet                                     #run
##############################################################

FROM meteorhacks/meteord:onbuild
