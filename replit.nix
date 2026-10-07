{pkgs}: {
  deps = [
    pkgs.ffmpeg
    pkgs.libsecret
    pkgs.sqlite
    pkgs.libxslt
    pkgs.libxml2
    pkgs.libwebp
    pkgs.libpng
    pkgs.libjpeg
    pkgs.harfbuzz
    pkgs.freetype
    pkgs.fontconfig
    pkgs.xorg.libxcb
    pkgs.xorg.libXrandr
    pkgs.xorg.libXfixes
    pkgs.xorg.libXext
    pkgs.xorg.libXdamage
    pkgs.xorg.libXcomposite
    pkgs.xorg.libX11
    pkgs.libudev0-shim
    pkgs.libdrm
    pkgs.mesa
    pkgs.alsa-lib
    pkgs.libxkbcommon
    pkgs.expat
    pkgs.cups
    pkgs.nspr
    pkgs.nss
    pkgs.dbus
    pkgs.at-spi2-core
    pkgs.at-spi2-atk
    pkgs.atk
    pkgs.cairo
    pkgs.pango
    pkgs.gtk3
    pkgs.glib
    # Workspace Node comes from the nodejs-24 module. Production ships its
    # verified runtime with the standalone app; do not add a competing Node.
  ];
}
