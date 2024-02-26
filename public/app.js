document.addEventListener('DOMContentLoaded', async () => {
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');

  const socketURL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : `https://${window.location.hostname}:3000`;
  const socket = io(socketURL);

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = stream;

  const peerConnection = new RTCPeerConnection();

  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', event.candidate);
    }
  };

  socket.on('ice-candidate', (iceCandidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
  });

  socket.on('offer', async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
  });

  socket.on('answer', async (answer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit('offer', offer);

  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };
});
