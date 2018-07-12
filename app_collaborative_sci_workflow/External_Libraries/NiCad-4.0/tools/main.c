/*
 * TXL Processor Version 8
 * J.R. Cordy, March 1995
 * Copyright 1995 by Legasys Corp. and James R. Cordy
 */

/* Added TL_finalize to assist in converting to re-entrant subroutine -- JRC 16.5.97 */
/* Fixed type of argc to be int -- JRC 3.7.15 */

#include "TLglob.h"

extern void TProg();

int main (argc, argv)
int argc;
char 	**argv;
{
    int code;
    TL_initialize (argc, argv);
    if (setjmp (TL_handlerArea->quit_env)) {
    	TL_finalize ();
	exit (TL_handlerArea->quitCode);
    }
    TProg ();
    TL_finalize ();
    exit (0);
}
