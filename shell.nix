{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_22
    git
  ];

  shellHook = ''
    echo "quartz dev shell (node $(node -v))"
  '';
}
